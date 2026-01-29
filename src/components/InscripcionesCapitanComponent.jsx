import React, { Component } from "react";
import { AuthContext } from "../context/AuthContext";
import InscripcionesService from "../services/InscripcionesService";
import EventosService from "../services/EventosService";
import ActividadesService from "../services/ActividadesService";
import CapitanService from "../services/CapitanService";
import Swal from "sweetalert2";
import "../css/InscripcionesCapitanComponent.css";

const serviceInscripciones = new InscripcionesService();
const serviceEventos = new EventosService();
const serviceActividades = new ActividadesService();
const serviceCapitan = new CapitanService();

class InscripcionesCapitanComponent extends Component {
	static contextType = AuthContext;

	state = {
		inscripciones: [],
		eventos: [],
		actividades: [],
		eventoSeleccionado: "",
		actividadSeleccionada: "",
		loading: false,
		loadingEventos: true,
		loadingActividades: false,
		seleccionandoCapitan: false,
		capitanActual: null,
		loadingCapitan: false,
	};

	componentDidMount() {
		this.cargarEventos();
	}

	cargarEventos = async () => {
		try {
			this.setState({ loadingEventos: true });
			const token = this.context.token;
			const data = await serviceEventos.getEventosCursoEscolar(token);

			// Filtrar solo eventos futuros o actuales
			const hoy = new Date();
			hoy.setHours(0, 0, 0, 0);
			const eventosFiltrados = data.filter((evento) => {
				const fechaEvento = new Date(evento.fechaEvento);
				return fechaEvento >= hoy;
			});

			this.setState({
				eventos: eventosFiltrados,
				loadingEventos: false,
			});
		} catch (error) {
			console.error("Error al cargar eventos:", error);
			this.setState({ loadingEventos: false });
			Swal.fire({
				title: "Error",
				text: "No se pudieron cargar los eventos",
				icon: "error",
				confirmButtonText: "Aceptar",
			});
		}
	};

	cargarActividades = async (idEvento) => {
		if (!idEvento) {
			this.setState({
				actividades: [],
				actividadSeleccionada: "",
				inscripciones: [],
			});
			return;
		}

		try {
			this.setState({ loadingActividades: true });
			const data = await serviceActividades.getActividadesEvento(idEvento);
			this.setState({
				actividades: data,
				actividadSeleccionada: "",
				loadingActividades: false,
			});
		} catch (error) {
			console.error("Error al cargar actividades:", error);
			this.setState({ loadingActividades: false });
			Swal.fire({
				title: "Error",
				text: "No se pudieron cargar las actividades",
				icon: "error",
				confirmButtonText: "Aceptar",
			});
		}
	};

	cargarInscripciones = async (idEvento, idActividad) => {
		if (!idEvento || !idActividad) {
			this.setState({ inscripciones: [] });
			return;
		}

		try {
			this.setState({ loading: true });
			const data =
				await serviceInscripciones.getInscripcionesQuierenSerCapitanPorActividad(
					idEvento,
					idActividad,
				);
			this.setState({
				inscripciones: data,
				loading: false,
			});
		} catch (error) {
			console.error("Error al cargar inscripciones:", error);
			this.setState({ loading: false });
			Swal.fire({
				title: "Error",
				text: "No se pudieron cargar las inscripciones de capitanes",
				icon: "error",
				confirmButtonText: "Aceptar",
			});
		}
	};

	verificarCapitanActual = async (idEvento, idActividad) => {
		if (!idEvento || !idActividad) {
			this.setState({ capitanActual: null });
			return;
		}

		try {
			this.setState({ loadingCapitan: true });

			// Obtener idEventoActividad
			const idEventoActividad = await serviceActividades.getEventoActividad(
				parseInt(idEvento),
				parseInt(idActividad),
			);

			// Verificar si hay capitán
			const token = this.context.token;
			const capitan = await serviceCapitan.getCapitanEventoActividad(
				idEventoActividad,
				token,
			);

			this.setState({
				capitanActual: capitan,
				loadingCapitan: false,
			});
		} catch (error) {
			// Si no hay capitán, el endpoint devuelve error
			this.setState({ capitanActual: null, loadingCapitan: false });
		}
	};

	handleEventoChange = (e) => {
		const idEvento = e.target.value;
		this.setState({ eventoSeleccionado: idEvento, inscripciones: [] });
		this.cargarActividades(idEvento);
	};

	handleActividadChange = (e) => {
		const idActividad = e.target.value;
		this.setState({ actividadSeleccionada: idActividad });
		if (idActividad) {
			this.cargarInscripciones(this.state.eventoSeleccionado, idActividad);
			this.verificarCapitanActual(this.state.eventoSeleccionado, idActividad);
		} else {
			this.setState({ capitanActual: null, inscripciones: [] });
		}
	};

	formatearFecha = (fecha) => {
		const date = new Date(fecha);
		return date.toLocaleDateString("es-ES", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	formatearFechaConHora = (fecha) => {
		const date = new Date(fecha);
		return date.toLocaleDateString("es-ES", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	seleccionarCapitanAlAzar = async () => {
		const { inscripciones, eventoSeleccionado, actividadSeleccionada } =
			this.state;

		if (!eventoSeleccionado || !actividadSeleccionada) {
			Swal.fire({
				title: "Error",
				text: "Debe seleccionar un evento y una actividad",
				icon: "error",
				confirmButtonText: "Aceptar",
			});
			return;
		}

		if (inscripciones.length === 0) {
			Swal.fire({
				title: "Sin solicitudes",
				text: "No hay solicitudes de capitanía para esta actividad",
				icon: "info",
				confirmButtonText: "Aceptar",
			});
			return;
		}

		// Confirmar acción
		const confirmacion = await Swal.fire({
			title: "¿Seleccionar Capitán al Azar?",
			text: `Se elegirá un capitán aleatorio entre ${inscripciones.length} solicitudes`,
			icon: "question",
			showCancelButton: true,
			confirmButtonColor: "#2c5aa0",
			cancelButtonColor: "#d33",
			confirmButtonText: "Sí, seleccionar",
			cancelButtonText: "Cancelar",
		});

		if (!confirmacion.isConfirmed) return;

		try {
			this.setState({ seleccionandoCapitan: true });

			// Seleccionar usuario al azar
			const indiceAleatorio = Math.floor(Math.random() * inscripciones.length);
			const usuarioSeleccionado = inscripciones[indiceAleatorio];

			// Obtener idEventoActividad
			const idEventoActividad = await serviceActividades.getEventoActividad(
				parseInt(eventoSeleccionado),
				parseInt(actividadSeleccionada),
			);

			// Crear capitán
			const token = this.context.token;
			console.log(idEventoActividad, usuarioSeleccionado);
			await serviceCapitan.crearCapitan(
				idEventoActividad,
				usuarioSeleccionado.idUsuario,
				token,
			);

			this.setState({ seleccionandoCapitan: false });

			// Mostrar resultado
			await Swal.fire({
				title: "¡Capitán Seleccionado!",
				html: `<strong>${usuarioSeleccionado.usuario}</strong> ha sido elegido como capitán`,
				icon: "success",
				confirmButtonText: "Aceptar",
			});

			// Recargar inscripciones y verificar capitán
			this.cargarInscripciones(eventoSeleccionado, actividadSeleccionada);
			this.verificarCapitanActual(eventoSeleccionado, actividadSeleccionada);
		} catch (error) {
			console.error("Error al seleccionar capitán:", error);
			this.setState({ seleccionandoCapitan: false });
			Swal.fire({
				title: "Error",
				text: "No se pudo asignar el capitán. Es posible que ya exista un capitán para esta actividad.",
				icon: "error",
				confirmButtonText: "Aceptar",
			});
		}
	};

	render() {
		const {
			inscripciones,
			eventos,
			actividades,
			eventoSeleccionado,
			actividadSeleccionada,
			loading,
			loadingEventos,
			loadingActividades,
			capitanActual,
			loadingCapitan,
		} = this.state;

		return (
			<div className="inscripciones-capitan-container">
				<div className="inscripciones-capitan-header">
					<h1>Solicitudes de Capitanía</h1>
					<p className="subtitle">
						Gestiona las solicitudes de usuarios que desean ser capitanes
					</p>
				</div>

				<div className="filtros-container">
					<div className="filtro-grupo">
						<label htmlFor="eventoSelect">Seleccionar Evento:</label>
						{loadingEventos ? (
							<div className="loading-spinner">Cargando eventos...</div>
						) : (
							<select
								id="eventoSelect"
								className="evento-select"
								value={eventoSeleccionado}
								onChange={this.handleEventoChange}
							>
								<option value="">-- Selecciona un evento --</option>
								{eventos.map((evento) => (
									<option key={evento.idEvento} value={evento.idEvento}>
										{evento.nombre} -{" "}
										{this.formatearFechaConHora(evento.fechaEvento)}
									</option>
								))}
							</select>
						)}
					</div>

					{eventoSeleccionado && (
						<div className="filtro-grupo">
							<label htmlFor="actividadSelect">Seleccionar Actividad:</label>
							{loadingActividades ? (
								<div className="loading-spinner">Cargando actividades...</div>
							) : (
								<select
									id="actividadSelect"
									className="actividad-select"
									value={actividadSeleccionada}
									onChange={this.handleActividadChange}
								>
									<option value="">-- Selecciona una actividad --</option>
									{actividades.map((actividad) => (
										<option
											key={actividad.idActividad}
											value={actividad.idActividad}
										>
											{actividad.nombreActividad}
										</option>
									))}
								</select>
							)}
						</div>
					)}
				</div>

				{loadingCapitan ? (
					<div className="loading-container">
						<div className="spinner"></div>
						<p>Verificando capitán...</p>
					</div>
				) : capitanActual ? (
					<div className="capitan-actual-container">
						<div className="capitan-actual-header">
							<h2>👑 Capitán Asignado</h2>
						</div>
						<div className="capitan-actual-card">
							<div className="usuario-header">
								<img
									src={
										capitanActual.imagen ||
										"https://cdn.pixabay.com/photo/2017/11/10/05/48/user-2935527_640.png"
									}
									alt={capitanActual.usuario}
									className="usuario-imagen"
								/>
								<div className="usuario-info">
									<h3>{capitanActual.usuario}</h3>
									<span className="estado-badge capitan">⭐ CAPITÁN</span>
								</div>
							</div>
							<div className="usuario-detalles">
								<div className="detalle-item">
									<span className="detalle-label">📧 Email:</span>
									<span className="detalle-value">{capitanActual.email}</span>
								</div>

								{capitanActual.role && (
									<div className="detalle-item">
										<span className="detalle-label">👤 Rol:</span>
										<span className="detalle-value">{capitanActual.role}</span>
									</div>
								)}

								{capitanActual.curso && (
									<div className="detalle-item">
										<span className="detalle-label">🎓 Curso:</span>
										<span className="detalle-value">{capitanActual.curso}</span>
									</div>
								)}

								{capitanActual.estadoUsuario !== undefined && (
									<div className="detalle-item">
										<span className="detalle-label">📊 Estado:</span>
										<span
											className={`detalle-value estado-${capitanActual.estadoUsuario ? "activo" : "inactivo"}`}
										>
											{capitanActual.estadoUsuario ? "✓ Activo" : "✗ Inactivo"}
										</span>
									</div>
								)}

								{capitanActual.fechaInicioCurso && (
									<div className="detalle-item">
										<span className="detalle-label">
											📅 Fecha Inicio Curso:
										</span>
										<span className="detalle-value">
											{this.formatearFecha(capitanActual.fechaInicioCurso)}
										</span>
									</div>
								)}

								{capitanActual.fechaFinCurso && (
									<div className="detalle-item">
										<span className="detalle-label">📅 Fecha Fin Curso:</span>
										<span className="detalle-value">
											{this.formatearFecha(capitanActual.fechaFinCurso)}
										</span>
									</div>
								)}
							</div>
						</div>
					</div>
				) : null}

				{eventoSeleccionado &&
					actividadSeleccionada &&
					inscripciones.length > 0 &&
					!capitanActual && (
						<div className="accion-capitan-container">
							<button
								className="btn-seleccionar-capitan"
								onClick={this.seleccionarCapitanAlAzar}
								disabled={this.state.seleccionandoCapitan}
							>
								{this.state.seleccionandoCapitan
									? "Seleccionando..."
									: "🎲 Seleccionar Capitán al Azar"}
							</button>
							<p className="info-seleccion">
								Hay {inscripciones.length} solicitud
								{inscripciones.length !== 1 ? "es" : ""} disponible
								{inscripciones.length !== 1 ? "s" : ""}
							</p>
						</div>
					)}

				{loading ? (
					<div className="loading-container">
						<div className="spinner"></div>
						<p>Cargando inscripciones...</p>
					</div>
				) : eventoSeleccionado &&
				  actividadSeleccionada &&
				  inscripciones.length === 0 ? (
					<div className="no-inscripciones">
						<p>📋 No hay solicitudes de capitanía para esta actividad</p>
					</div>
				) : eventoSeleccionado &&
				  actividadSeleccionada &&
				  inscripciones.length > 0 ? (
					<div className="inscripciones-grid">
						{inscripciones.map((usuario) => (
							<div key={usuario.idUsuario} className="inscripcion-card">
								<div className="usuario-header">
									<img
										src={
											usuario.imagen ||
											"https://cdn.pixabay.com/photo/2017/11/10/05/48/user-2935527_640.png"
										}
										alt={usuario.usuario}
										className="usuario-imagen"
									/>
									<div className="usuario-info">
										<h3>{usuario.usuario}</h3>
										<span
											className={`estado-badge ${usuario.estadoUsuario ? "activo" : "inactivo"}`}
										>
											{usuario.estadoUsuario ? "Activo" : "Inactivo"}
										</span>
									</div>
								</div>

								<div className="usuario-detalles">
									<div className="detalle-item">
										<span className="detalle-label">📧 Email:</span>
										<span className="detalle-value">{usuario.email}</span>
									</div>

									<div className="detalle-item">
										<span className="detalle-label">👤 Rol:</span>
										<span className="detalle-value">{usuario.role}</span>
									</div>

									<div className="detalle-item">
										<span className="detalle-label">🎓 Curso:</span>
										<span className="detalle-value">{usuario.curso}</span>
									</div>

									<div className="detalle-item">
										<span className="detalle-label">📅 Fecha Inicio:</span>
										<span className="detalle-value">
											{this.formatearFecha(usuario.fechaInicioCurso)}
										</span>
									</div>

									<div className="detalle-item">
										<span className="detalle-label">📅 Fecha Fin:</span>
										<span className="detalle-value">
											{this.formatearFecha(usuario.fechaFinCurso)}
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				) : null}
			</div>
		);
	}
}

export default InscripcionesCapitanComponent;

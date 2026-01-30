import React, { Component } from "react";
import AuthContext from "../context/AuthContext";
import PagosService from "../services/PagosService";
import GestionEventoService from "../services/GestionEventoService";
import EventosService from "../services/EventosService";
import PrecioActividadService from "../services/PrecioActividadService";
import ActividadesService from "../services/ActividadesService";
import TablaPagosAgrupadosComponent from "./TablaPagosAgrupadosComponent";
import Swal from "sweetalert2";
import {
	FaPlus,
	FaCheckCircle,
	FaClock,
	FaExclamationTriangle,
	FaEdit,
	FaTimes,
	FaCalendarAlt,
	FaTasks,
	FaMoneyBillWave,
} from "react-icons/fa";
import "../css/PagosComponent.css";

const servicePagos = new PagosService();
const serviceGestionEvento = new GestionEventoService();
const serviceEventos = new EventosService();
const servicePrecioActividad = new PrecioActividadService();
const serviceActividades = new ActividadesService();

export class PagosComponent extends Component {
	static contextType = AuthContext;

	state = {
		cursos: [],
		cursoSeleccionado: "",
		pagos: [],
		pestanaActiva: "pagados", // 'pagados' o 'pendientes'
		cargando: true,
		mostrarModalPago: false,
		pagoSeleccionado: null,
		cantidadPago: "",
		preciosActividades: {},
		modoEdicion: false,
		estadoPago: "Pendiente",
		// Estados para filtros
		eventosLista: [],
		actividadesLista: [],
		filtroEvento: "",
		filtroActividad: "",
		// Estados para crear pago
		mostrarModalCrearPago: false,
		preciosActividadesLista: [],
		nuevoPago: {
			cantidad: "",
			estado: "PENDIENTE",
		},
	};

	componentDidMount = async () => {
		await this.loadCursos();
		await this.loadPreciosActividades();
		await this.cargarEventos();
	};

	loadCursos = async () => {
		try {
			let token = this.context.token;
			const cursos = await serviceGestionEvento.getCursosActivos(token);
			this.setState({
				cursos,
				cursoSeleccionado: cursos.length > 0 ? cursos[0].idCurso : "",
				cargando: false,
			});
			if (cursos.length > 0) {
				await this.loadPagos(cursos[0].idCurso);
			}
		} catch (error) {
			// Error handled
			this.setState({ cargando: false });
		}
	};

	loadPagos = async (idCurso) => {
		if (!idCurso) return;

		this.setState({ cargando: true });
		try {
			let token = this.context.token;
			const pagos = await servicePagos.getPagosCompletoCurso(idCurso, token);
			this.setState({ pagos, cargando: false });
		} catch (error) {
			// Error handled
			this.setState({ cargando: false });
		}
	};

	loadPreciosActividades = async () => {
		try {
			const precios = await servicePrecioActividad.getPreciosActividades();
			this.setState({ preciosActividadesLista: precios });
		} catch (error) {
			console.error("Error al cargar precios de actividades:", error);
		}
	};

	cargarEventos = async () => {
		try {
			let token = this.context.token;
			const eventos = await serviceEventos.getEventosCursoEscolar(token);
			this.setState({ eventosLista: eventos });
		} catch (error) {
			console.error("Error al cargar eventos:", error);
		}
	};

	cargarActividadesPorEvento = async (idEvento) => {
		if (!idEvento) {
			this.setState({ actividadesLista: [], filtroActividad: "" });
			return;
		}

		try {
			const actividades = await serviceActividades.getActividadesEvento(
				parseInt(idEvento),
			);
			const precios = await servicePrecioActividad.getPreciosActividades();

			const actividadesConPrecio = actividades
				.map((actividad) => {
					const precioActividad = precios.find(
						(p) =>
							p.idEvento === parseInt(idEvento) &&
							p.idActividad === actividad.idActividad,
					);
					if (precioActividad) {
						return {
							idEventoActividad: precioActividad.idEventoActividad,
							idPrecioActividad: precioActividad.idPrecioActividad,
							nombreActividad: actividad.nombre,
							precioTotal: precioActividad.precioTotal,
						};
					}
					return null;
				})
				.filter((act) => act !== null);

			this.setState({ actividadesLista: actividadesConPrecio });
		} catch (error) {
			console.error("Error al cargar actividades:", error);
			this.setState({ actividadesLista: [] });
		}
	};

	handleFiltroEventoChange = async (e) => {
		const idEvento = e.target.value;
		this.setState({
			filtroEvento: idEvento,
			filtroActividad: "",
			cargando: true,
		});
		if (idEvento) {
			try {
				let token = this.context.token;
				// Cargar pagos del evento específico
				const pagosPorEvento = await servicePagos.getPagosEvento(
					idEvento,
					token,
				);
				this.setState({ pagos: pagosPorEvento });

				// Extraer actividades únicas de los pagos
				const actividadesUnicas = [];
				const idsVistos = new Set();

				pagosPorEvento.forEach((pago) => {
					if (
						pago.idEventoActividad &&
						!idsVistos.has(pago.idEventoActividad)
					) {
						idsVistos.add(pago.idEventoActividad);
						actividadesUnicas.push({
							idEventoActividad: pago.idEventoActividad,
							idPrecioActividad: pago.idPrecioActividad,
							nombreActividad: pago.actividad,
							precioTotal: pago.precioTotal,
						});
					}
				});

				this.setState({ actividadesLista: actividadesUnicas });
			} catch (error) {
				console.error("Error al cargar datos del evento:", error);
			} finally {
				this.setState({ cargando: false });
			}
		} else {
			// Si no hay evento seleccionado, cargar todos los pagos del curso
			const { cursoSeleccionado } = this.state;
			if (cursoSeleccionado) {
				await this.loadPagos(cursoSeleccionado);
			}
			this.setState({ actividadesLista: [], cargando: false });
		}
	};

	handleFiltroActividadChange = (e) => {
		this.setState({ filtroActividad: e.target.value });
	};

	handleCursoChange = async (e) => {
		const idCurso = parseInt(e.target.value);
		this.setState({
			cursoSeleccionado: idCurso,
			filtroEvento: "",
			filtroActividad: "",
			actividadesLista: [],
		});
		await this.loadPagos(idCurso);
	};

	recargarPagos = async () => {
		const { filtroEvento, cursoSeleccionado } = this.state;

		if (filtroEvento) {
			// Si hay un evento seleccionado, recargar los pagos de ese evento
			this.setState({ cargando: true });
			try {
				let token = this.context.token;
				const pagosPorEvento = await servicePagos.getPagosEvento(
					filtroEvento,
					token,
				);
				this.setState({ pagos: pagosPorEvento });

				// Actualizar actividades únicas
				const actividadesUnicas = [];
				const idsVistos = new Set();

				pagosPorEvento.forEach((pago) => {
					if (
						pago.idEventoActividad &&
						!idsVistos.has(pago.idEventoActividad)
					) {
						idsVistos.add(pago.idEventoActividad);
						actividadesUnicas.push({
							idEventoActividad: pago.idEventoActividad,
							idPrecioActividad: pago.idPrecioActividad,
							nombreActividad: pago.actividad,
							precioTotal: pago.precioTotal,
						});
					}
				});

				this.setState({ actividadesLista: actividadesUnicas });
			} catch (error) {
				console.error("Error al recargar pagos del evento:", error);
			} finally {
				this.setState({ cargando: false });
			}
		} else {
			// Si no hay evento seleccionado, recargar todos los pagos del curso
			await this.loadPagos(cursoSeleccionado);
		}
	};

	cambiarPestana = (pestana) => {
		this.setState({ pestanaActiva: pestana });
	};

	getPagosFiltrados = () => {
		const { pagos, pestanaActiva, filtroActividad } = this.state;

		let pagosFiltrados = pagos;

		// Filtrar por pestaña activa
		if (pestanaActiva === "pagados") {
			pagosFiltrados = pagosFiltrados.filter(
				(pago) => pago.estado && pago.estado.toLowerCase() === "pagado",
			);
		} else {
			pagosFiltrados = pagosFiltrados.filter(
				(pago) => pago.estado && pago.estado.toLowerCase() !== "pagado",
			);
		}

		// Filtrar por actividad si está seleccionada (el evento ya viene filtrado del servidor)
		if (filtroActividad) {
			pagosFiltrados = pagosFiltrados.filter(
				(pago) => pago.idEventoActividad === parseInt(filtroActividad),
			);
		}

		return pagosFiltrados;
	};

	getPagosAgrupadosPagados = async () => {
		// Usar getPagosFiltrados para obtener los pagos ya filtrados por evento y actividad
		const pagosFiltrados = this.getPagosFiltrados();

		// Como getPagosFiltrados ya filtra por pestaña, solo obtenemos los pagados
		// (si estamos en la pestaña de pagados, ya vendrán filtrados)
		const pagosPagados = pagosFiltrados;

		// Agrupar por idEventoActividad
		const agrupados = {};
		pagosPagados.forEach((pago) => {
			const key = pago.idEventoActividad;
			if (!agrupados[key]) {
				agrupados[key] = {
					...pago,
					totalPagado: 0,
					numPagos: 0,
				};
			}
			agrupados[key].totalPagado += pago.cantidadPagada || 0;
			agrupados[key].numPagos += 1;
		});

		// Obtener precios y validar
		const resultado = [];
		for (const key in agrupados) {
			const grupo = agrupados[key];
			try {
				if (grupo.idPrecioActividad) {
					const precioData = await servicePrecioActividad.getPrecioActividad(
						grupo.idPrecioActividad,
					);
					grupo.precioReal = precioData.precioTotal;
				}
			} catch (error) {
				// Error handled
			}
			resultado.push(grupo);
		}

		return resultado;
	};

	formatearFecha = (fecha) => {
		if (!fecha) return "-";
		return new Date(fecha).toLocaleDateString("es-ES", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		});
	};

	getEstadoClase = (estado) => {
		if (!estado) return "estado-pendiente";
		const estadoLower = estado.toLowerCase();
		if (estadoLower === "pagado") return "estado-pagado";
		if (estadoLower === "pendiente") return "estado-pendiente";
		return "estado-parcial";
	};

	abrirModalPago = (pago, esEdicion = false) => {
		this.setState({
			mostrarModalPago: true,
			pagoSeleccionado: pago,
			cantidadPago: esEdicion ? pago.cantidadPagada.toString() : "",
			modoEdicion: esEdicion,
			estadoPago: esEdicion ? pago.estado : "Pendiente",
		});
	};

	cerrarModalPago = () => {
		this.setState({
			mostrarModalPago: false,
			pagoSeleccionado: null,
			cantidadPago: "",
			modoEdicion: false,
			estadoPago: "Pendiente",
		});
	};

	handleCantidadChange = (e) => {
		const valor = e.target.value;
		if (valor === "" || /^\d+(\.\d{0,2})?$/.test(valor)) {
			this.setState({ cantidadPago: valor });
		}
	};

	procesarPago = async (e) => {
		e.preventDefault();
		const {
			pagoSeleccionado,
			cantidadPago,
			cursoSeleccionado,
			modoEdicion,
			estadoPago,
		} = this.state;

		if (!cantidadPago || parseFloat(cantidadPago) <= 0) {
			Swal.fire({
				icon: "warning",
				title: "Cantidad inválida",
				text: "Por favor, ingresa una cantidad válida",
				confirmButtonColor: "#9a7fd4",
			});
			return;
		}

		try {
			let token = this.context.token;
			const cantidad = parseInt(parseFloat(cantidadPago));

			if (modoEdicion) {
				await servicePagos.updatePago(
					pagoSeleccionado.idPago,
					cantidad,
					estadoPago,
					token,
				);
				Swal.fire({
					icon: "success",
					title: "¡Éxito!",
					text: "Pago actualizado exitosamente",
					confirmButtonColor: "#9a7fd4",
				});
			} else {
				await servicePagos.crearPago(
					pagoSeleccionado.idEventoActividad,
					cursoSeleccionado,
					cantidad,
					token,
				);
				Swal.fire({
					icon: "success",
					title: "¡Éxito!",
					text: "Pago registrado exitosamente",
					confirmButtonColor: "#9a7fd4",
				});
			}

			this.cerrarModalPago();
			await this.recargarPagos();
		} catch (error) {
			console.error("Error al procesar pago:", error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: "Error al procesar el pago. Inténtalo de nuevo.",
			});
		}
	};

	abrirModalCrearPago = () => {
		if (!this.state.filtroEvento || !this.state.filtroActividad) {
			Swal.fire({
				icon: "warning",
				title: "Atención",
				text: "Primero selecciona un evento y una actividad",
			});
			return;
		}

		this.setState({
			mostrarModalCrearPago: true,
			nuevoPago: {
				cantidad: "",
				estado: "PENDIENTE",
			},
		});
	};

	cerrarModalCrearPago = () => {
		this.setState({
			mostrarModalCrearPago: false,
			nuevoPago: {
				cantidad: "",
				estado: "PENDIENTE",
			},
		});
	};

	handleNuevoPagoChange = (e) => {
		const { name, value } = e.target;
		this.setState({
			nuevoPago: {
				...this.state.nuevoPago,
				[name]: value,
			},
		});
	};

	crearNuevoPago = async (e) => {
		e.preventDefault();
		const { nuevoPago, cursoSeleccionado, filtroActividad, actividadesLista } =
			this.state;

		if (!nuevoPago.cantidad || parseFloat(nuevoPago.cantidad) <= 0) {
			Swal.fire({
				icon: "error",
				title: "Error",
				text: "Por favor, ingresa una cantidad válida",
			});
			return;
		}

		// Obtener idPrecioActividad de la actividad seleccionada en el filtro
		const actividadSeleccionada = actividadesLista.find(
			(act) => act.idEventoActividad === parseInt(filtroActividad),
		);

		if (!actividadSeleccionada) {
			Swal.fire({
				icon: "error",
				title: "Error",
				text: "No se pudo obtener la información de la actividad",
			});
			return;
		}

		try {
			let token = this.context.token;
			const pagoData = {
				idPago: 0,
				idCurso: cursoSeleccionado,
				idPrecioActividad: actividadSeleccionada.idPrecioActividad,
				cantidad: parseInt(parseFloat(nuevoPago.cantidad)),
				estado: nuevoPago.estado,
			};

			await servicePagos.createPago(pagoData, token);
			Swal.fire({
				icon: "success",
				title: "¡Éxito!",
				text: "Pago creado correctamente",
				timer: 2000,
				showConfirmButton: false,
			});

			this.cerrarModalCrearPago();
			await this.recargarPagos();
		} catch (error) {
			console.error("Error al crear pago:", error);
			Swal.fire({
				icon: "error",
				title: "Error",
				text: "No se pudo crear el pago. Inténtalo de nuevo.",
			});
		}
	};

	render() {
		const { cursos, cursoSeleccionado, pestanaActiva, cargando } = this.state;
		const pagosFiltrados = this.getPagosFiltrados();

		return (
			<div className="pagos-wrapper">
				<div className="pagos-header">
					<h1 className="pagos-title">Gestión de Pagos</h1>
				</div>

				<div className="pagos-controls">
					<div className="filter-group">
						<label className="filter-label">Curso:</label>
						<select
							className="filter-select"
							value={cursoSeleccionado}
							onChange={this.handleCursoChange}
							disabled={cargando || cursos.length === 0}
						>
							{cursos.length === 0 ? (
								<option value="">No hay cursos disponibles</option>
							) : (
								cursos.map((curso) => (
									<option key={curso.idCurso} value={curso.idCurso}>
										{curso.nombre}
									</option>
								))
							)}
						</select>
					</div>

					<div className="filter-group">
						<label className="filter-label">Evento:</label>
						<select
							className="filter-select"
							value={this.state.filtroEvento}
							onChange={this.handleFiltroEventoChange}
						>
							<option value="">Todos los eventos</option>
							{this.state.eventosLista.map((evento) => (
								<option key={evento.idEvento} value={evento.idEvento}>
									Evento: {evento.idEvento} -{" "}
									{new Date(evento.fechaEvento).toLocaleDateString()}
								</option>
							))}
						</select>
					</div>

					<div className="filter-group">
						<label className="filter-label">Actividad:</label>
						<select
							className="filter-select"
							value={this.state.filtroActividad}
							onChange={this.handleFiltroActividadChange}
							disabled={!this.state.filtroEvento}
						>
							<option value="">
								{this.state.filtroEvento
									? "Todas las actividades"
									: "Selecciona un evento primero"}
							</option>
							{this.state.actividadesLista.map((actividad) => (
								<option
									key={actividad.idEventoActividad}
									value={actividad.idEventoActividad}
								>
									{actividad.nombreActividad} - {actividad.precioTotal}€
								</option>
							))}
						</select>
					</div>

					<button className="btn-crear-pago" onClick={this.abrirModalCrearPago}>
						<FaPlus /> Crear Pago
					</button>
				</div>

				<div className="tabs-container">
					<button
						className={`tab-button ${pestanaActiva === "pagados" ? "active" : ""}`}
						onClick={() => this.cambiarPestana("pagados")}
					>
						<FaCheckCircle /> Actividades Pagadas
					</button>
					<button
						className={`tab-button ${pestanaActiva === "pendientes" ? "active" : ""}`}
						onClick={() => this.cambiarPestana("pendientes")}
					>
						<FaClock /> Actividades Pendientes
					</button>
				</div>

				<div className="pagos-content">
					{cargando ? (
						<div className="empty-state">
							<div className="empty-state-icon">⏳</div>
							<p className="empty-state-text">Cargando pagos...</p>
						</div>
					) : pagosFiltrados.length === 0 ? (
						<div className="empty-state">
							<div className="empty-state-icon"></div>
							<p className="empty-state-text">
								{pestanaActiva === "pagados"
									? "No hay actividades pagadas"
									: "No hay actividades pendientes de pago"}
							</p>
							<p className="empty-state-subtext">
								Selecciona otro curso para ver más información
							</p>
						</div>
					) : pestanaActiva === "pagados" ? (
						<TablaPagosAgrupadosComponent
							getPagosAgrupados={this.getPagosAgrupadosPagados}
							formatearFecha={this.formatearFecha}
						/>
					) : (
						<div className="pagos-table-container">
							<table className="pagos-table">
								<thead>
									<tr>
										<th>Evento</th>
										<th>Fecha Evento</th>
										<th>Actividad</th>
										<th>Curso</th>
										<th>Precio Total</th>
										<th>Cantidad Pagada</th>
										<th>Estado</th>
										{pestanaActiva === "pendientes" && <th>Acciones</th>}
									</tr>
								</thead>
								<tbody>
									{pagosFiltrados.map((pago) => (
										<tr key={pago.id}>
											<td>{pago.idEvento}</td>
											<td>{this.formatearFecha(pago.fechaEvento)}</td>
											<td>{pago.actividad || "-"}</td>
											<td>{pago.curso || "-"}</td>
											<td>{pago.precioTotal}€</td>
											<td>{pago.cantidadPagada}€</td>
											<td>
												<span
													className={`estado-badge ${this.getEstadoClase(pago.estado)}`}
												>
													{pago.estado || "Pendiente"}
												</span>
											</td>
											{pestanaActiva === "pendientes" && (
												<td>
													<div
														style={{
															display: "flex",
															gap: "8px",
															justifyContent: "center",
														}}
													>
														{pago.estado?.toLowerCase() !== "pagado" && (
															<button
																className="pagos-btn-editar"
																onClick={() => this.abrirModalPago(pago, true)}
															>
																<FaEdit /> Editar
															</button>
														)}
													</div>
												</td>
											)}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>

				{this.state.mostrarModalPago && (
					<div className="modal-overlay" onClick={this.cerrarModalPago}>
						<div
							className="modal-content-pago"
							onClick={(e) => e.stopPropagation()}
						>
							<button className="modal-close" onClick={this.cerrarModalPago}>
								<FaTimes />
							</button>
							<h2>
								{this.state.modoEdicion ? "Editar Pago" : "Registrar Pago"}
							</h2>

							<div className="pago-info">
								<p>
									<strong>Actividad:</strong>{" "}
									{this.state.pagoSeleccionado?.actividad}
								</p>
								<p>
									<strong>Precio Total:</strong>{" "}
									{this.state.pagoSeleccionado?.precioTotal}€
								</p>
								<p>
									<strong>Cantidad Pagada:</strong>{" "}
									{this.state.pagoSeleccionado?.cantidadPagada}€
								</p>
								<p>
									<strong>Pendiente:</strong>{" "}
									{this.state.pagoSeleccionado?.precioTotal -
										this.state.pagoSeleccionado?.cantidadPagada || 0}
									€
								</p>
							</div>

							<form onSubmit={this.procesarPago}>
								<div className="form-group-pago">
									<label>Cantidad a pagar (€):</label>
									<input
										type="number"
										step="0.01"
										min="0.01"
										className="input-cantidad"
										value={this.state.cantidadPago}
										onChange={this.handleCantidadChange}
										placeholder="Ingrese la cantidad"
										required
									/>
								</div>

								{this.state.modoEdicion && (
									<div className="form-group-pago">
										<label>Estado del pago:</label>
										<select
											className="input-cantidad"
											value={this.state.estadoPago}
											onChange={(e) =>
												this.setState({ estadoPago: e.target.value })
											}
											required
										>
											<option value="Pendiente">Pendiente</option>
											<option value="Exento">Exento de pago</option>
											<option value="Pagado">Pagado</option>
										</select>
									</div>
								)}

								<div className="modal-actions-pago">
									<button
										type="button"
										className="btn-cancel-pago"
										onClick={this.cerrarModalPago}
									>
										Cancelar
									</button>
									<button type="submit" className="btn-submit-pago">
										{this.state.modoEdicion
											? "Actualizar Pago"
											: "Confirmar Pago"}
									</button>
								</div>
							</form>
						</div>
					</div>
				)}
				{this.state.mostrarModalCrearPago && (
					<div className="modal-overlay" onClick={this.cerrarModalCrearPago}>
						<div
							className="modal-content-pago"
							onClick={(e) => e.stopPropagation()}
						>
							<button
								className="modal-close"
								onClick={this.cerrarModalCrearPago}
							>
								<FaTimes />
							</button>
							<h2>Crear Nuevo Pago</h2>
							<div className="pago-info">
								<p>
									<strong>Evento:</strong>{" "}
									{this.state.eventosLista.find(
										(e) => e.idEvento === parseInt(this.state.filtroEvento),
									)?.nombre || "-"}
								</p>
								<p>
									<strong>Actividad:</strong>{" "}
									{this.state.actividadesLista.find(
										(a) =>
											a.idEventoActividad ===
											parseInt(this.state.filtroActividad),
									)?.nombreActividad || "-"}
								</p>
								<p>
									<strong>Precio Total:</strong>{" "}
									{this.state.actividadesLista.find(
										(a) =>
											a.idEventoActividad ===
											parseInt(this.state.filtroActividad),
									)?.precioTotal || 0}
									€
								</p>
							</div>
							<form onSubmit={this.crearNuevoPago}>
								<div className="form-group-pago">
									<label>Cantidad a pagar (€):</label>
									<input
										type="number"
										step="0.01"
										min="0.01"
										className="input-cantidad"
										name="cantidad"
										value={this.state.nuevoPago.cantidad}
										onChange={this.handleNuevoPagoChange}
										placeholder="Ingrese la cantidad"
										required
									/>
								</div>

								<div className="form-group-pago">
									<label>Estado del pago:</label>
									<select
										className="input-cantidad"
										name="estado"
										value={this.state.nuevoPago.estado}
										onChange={this.handleNuevoPagoChange}
										required
									>
										<option value="PENDIENTE">Pendiente</option>
										<option value="EXENTO">Exento</option>
										<option value="PAGADO">Pagado</option>
									</select>
								</div>

								<div className="modal-actions-pago">
									<button
										type="button"
										className="btn-cancel-pago"
										onClick={this.cerrarModalCrearPago}
									>
										Cancelar
									</button>
									<button type="submit" className="btn-submit-pago">
										Crear Pago
									</button>
								</div>
							</form>
						</div>
					</div>
				)}
			</div>
		);
	}
}

export default PagosComponent;

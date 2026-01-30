import React, { Component } from "react";
import "../css/MaterialesSolicitadosComponent.css";
import AuthContext from "../context/AuthContext";
import Swal from "sweetalert2";
import MaterialesService from "../services/MaterialesService";
import ActividadesService from "../services/ActividadesService";
import EventosService from "../services/EventosService";
import { FaPlus, FaClock, FaCheckCircle, FaTimes } from "react-icons/fa";

const serviceActividades = new ActividadesService();
const serviceEventos = new EventosService();

export class MaterialesSolicitadosComponent extends Component {
	static contextType = AuthContext;

	constructor(props) {
		super(props);
		this.state = {
			materiales: [],
			cargando: true,
			error: null,
			mostrarModalSolicitar: false,
			mostrarModalAportar: false,
			nombreMaterial: "",
			materialSeleccionado: null,
			idEventoModal: "",
			idActividadModal: "",
			eventosLista: [],
			actividadesLista: [],
			// Filtros
			filtroEvento: "",
			filtroActividad: "",
			eventosFiltroLista: [],
			actividadesFiltroLista: [],
			// Control de actualizaciones
			ultimaActualizacion: null,
			// Filtro de estado de materiales
			filtroEstado: "todos", // "todos", "pendientes", "aportados"
		};
	}

	componentDidMount() {
		this.obtenerMateriales();
		this.obtenerEventos();
		this.obtenerEventosFiltro();
	}

	componentDidUpdate(prevProps, prevState) {
		// Recargar materiales si el filtro de evento cambió a vacío
		if (
			this.state.filtroEvento !== prevState.filtroEvento &&
			!this.state.filtroEvento
		) {
			this.obtenerMateriales();
		}

		// Recargar materiales cuando se actualiza después de aportar o solicitar
		if (
			this.state.ultimaActualizacion !== prevState.ultimaActualizacion &&
			this.state.ultimaActualizacion
		) {
			if (this.state.filtroEvento && this.state.filtroActividad) {
				this.aplicarFiltroActividad(
					this.state.filtroEvento,
					this.state.filtroActividad,
				);
			} else {
				this.obtenerMateriales();
			}
		}
	}

	obtenerMateriales = () => {
		MaterialesService.obtenerMateriales()
			.then((response) => {
				this.setState({
					materiales: response.data,
					cargando: false,
				});
			})
			.catch((error) => {
				// Error handled
				this.setState({
					error: "Error al cargar los materiales",
					cargando: false,
				});
			});
	};

	obtenerEventos = () => {
		serviceEventos
			.getEventosCursoEscolar(this.context.token)
			.then((data) => {
				this.setState({
					eventosLista: data,
				});
			})
			.catch((error) => {
				// Error handled
			});
	};

	obtenerEventosFiltro = () => {
		serviceEventos
			.getEventosCursoEscolar(this.context.token)
			.then((data) => {
				this.setState({
					eventosFiltroLista: data,
				});
			})
			.catch((error) => {
				// Error handled
			});
	};

	obtenerActividadesPorEventoFiltro = (idEvento) => {
		if (!idEvento) {
			this.setState({
				actividadesFiltroLista: [],
				filtroActividad: "",
			});
			// Recargar todos los materiales cuando se limpia el filtro
			this.obtenerMateriales();
			return;
		}

		serviceActividades
			.getActividadesEvento(idEvento)
			.then((data) => {
				this.setState({
					actividadesFiltroLista: data,
					filtroActividad: "",
				});
			})
			.catch((error) => {
				// Error handled
				this.setState({ actividadesFiltroLista: [] });
			});
	};

	aplicarFiltroActividad = async (idEvento, idActividad) => {
		if (!idEvento || !idActividad) {
			// Si no hay actividad seleccionada, recargar todos los materiales
			this.obtenerMateriales();
			return;
		}

		try {
			const idEventoActividad = await serviceActividades.getEventoActividad(
				parseInt(idEvento),
				parseInt(idActividad),
			);

			this.setState({ cargando: true });
			MaterialesService.getMaterialesPorActividad(idEventoActividad)
				.then((response) => {
					this.setState({
						materiales: response.data,
						cargando: false,
					});
				})
				.catch((error) => {
					// Error handled
					this.setState({
						error: "Error al cargar los materiales",
						cargando: false,
					});
				});
		} catch (error) {
			// Error handled
			this.setState({ cargando: false });
		}
	};

	obtenerActividadesPorEvento = (idEvento) => {
		if (!idEvento) {
			this.setState({ actividadesLista: [], idActividadModal: "" });
			return;
		}

		serviceActividades
			.getActividadesEvento(idEvento)
			.then((data) => {
				this.setState({
					actividadesLista: data,
					idActividadModal: "",
				});
			})
			.catch((error) => {
				// Error handled
				this.setState({ actividadesLista: [] });
			});
	};

	formatearFecha = (fecha) => {
		const date = new Date(fecha);
		return date.toLocaleDateString("es-ES", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
		});
	};

	abrirModalSolicitar = () => {
		this.setState({
			mostrarModalSolicitar: true,
			nombreMaterial: "",
			idEventoModal: "",
			idActividadModal: "",
			actividadesLista: [],
		});
	};

	cerrarModalSolicitar = () => {
		this.setState({
			mostrarModalSolicitar: false,
			nombreMaterial: "",
			idEventoModal: "",
			idActividadModal: "",
			actividadesLista: [],
		});
	};

	abrirModalAportar = (material) => {
		this.setState({
			mostrarModalAportar: true,
			materialSeleccionado: material,
		});
	};

	cerrarModalAportar = () => {
		this.setState({
			mostrarModalAportar: false,
			materialSeleccionado: null,
		});
	};

	solicitarMaterial = async () => {
		if (
			!this.state.nombreMaterial ||
			!this.state.idEventoModal ||
			!this.state.idActividadModal
		) {
			Swal.fire("Error", "Por favor completa todos los campos", "error");
			return;
		}

		if (!this.context.usuario || !this.context.usuario.idUsuario) {
			Swal.fire("Error", "Debes iniciar sesión", "error");
			return;
		}

		try {
			// Obtener el idEventoActividad
			const idEventoActividad = await serviceActividades.getEventoActividad(
				parseInt(this.state.idEventoModal),
				parseInt(this.state.idActividadModal),
			);

			const datos = {
				idMaterial: 0,
				idEventoActividad: idEventoActividad,
				idUsuario: this.context.usuario.idUsuario,
				nombreMaterial: this.state.nombreMaterial,
				pendiente: true,
				fechaSolicitud: new Date().toISOString(),
			};

			MaterialesService.crearMaterial(datos)
				.then((response) => {
					Swal.fire("¡Éxito!", "Material solicitado correctamente", "success");
					this.cerrarModalSolicitar();
					// Disparar actualización automática
					this.setState({ ultimaActualizacion: Date.now() });
				})
				.catch((error) => {
					// Error handled
					Swal.fire("Error", "Error al solicitar el material", "error");
				});
		} catch (error) {
			// Error handled
			Swal.fire("Error", "Error al procesar la solicitud", "error");
		}
	};

	aportarMaterial = () => {
		if (!this.state.materialSeleccionado) {
			Swal.fire("Error", "Selecciona un material", "error");
			return;
		}

		if (!this.context.usuario || !this.context.usuario.idUsuario) {
			Swal.fire("Error", "Debes iniciar sesión", "error");
			return;
		}

		const datos = {
			idMaterial: this.state.materialSeleccionado.idMaterial,
			idEventoActividad: this.state.materialSeleccionado.idEventoActividad,
			idUsuario: this.state.materialSeleccionado.idUsuario,
			nombreMaterial: this.state.materialSeleccionado.nombreMaterial,
			pendiente: false,
			fechaSolicitud: this.state.materialSeleccionado.fechaSolicitud,
			idUsuarioAportacion: this.context.usuario.idUsuario,
		};

		MaterialesService.actualizarMaterial(datos)
			.then((response) => {
				Swal.fire("¡Éxito!", "Material aportado correctamente", "success");
				this.cerrarModalAportar();
				// Disparar actualización automática
				this.setState({ ultimaActualizacion: Date.now() });
			})
			.catch((error) => {
				// Error handled
				Swal.fire("Error", "Error al aportar el material", "error");
			});
	};

	render() {
		const {
			materiales,
			cargando,
			error,
			mostrarModalSolicitar,
			mostrarModalAportar,
			materialSeleccionado,
		} = this.state;

		if (cargando) {
			return (
				<div className="materiales-container">
					<div className="cargando">Cargando materiales...</div>
				</div>
			);
		}

		if (error) {
			return (
				<div className="materiales-container">
					<div className="error">{error}</div>
				</div>
			);
		}

		return (
			<div className="materiales-container">
				<div className="materiales-header">
					<h1>Materiales</h1>
					<button className="btn-solicitar" onClick={this.abrirModalSolicitar}>
						<FaPlus /> Solicitar Material
					</button>
				</div>

				{/* Botones de filtro por estado */}
				<div className="filtro-estado-container">
					<button
						className={`btn-filtro-estado ${this.state.filtroEstado === "todos" ? "activo" : ""}`}
						onClick={() => this.setState({ filtroEstado: "todos" })}
					>
						Todos
					</button>
					<button
						className={`btn-filtro-estado ${this.state.filtroEstado === "pendientes" ? "activo" : ""}`}
						onClick={() => this.setState({ filtroEstado: "pendientes" })}
					>
						<FaClock /> Pendientes
					</button>
					<button
						className={`btn-filtro-estado ${this.state.filtroEstado === "aportados" ? "activo" : ""}`}
						onClick={() => this.setState({ filtroEstado: "aportados" })}
					>
						<FaCheckCircle /> Aportados
					</button>
				</div>

				{/* Filtros */}
				<div className="materiales-filtros">
					<div className="mat-form-group">
						<label>Filtrar por Evento:</label>
						<select
							value={this.state.filtroEvento}
							onChange={(e) => {
								const idEvento = e.target.value;
								this.setState({ filtroEvento: idEvento });
								this.obtenerActividadesPorEventoFiltro(idEvento);
							}}
						>
							<option value="">Todos los eventos</option>
							{this.state.eventosFiltroLista.map((evento) => (
								<option key={evento.idEvento} value={evento.idEvento}>
									Evento {evento.idEvento} -{" "}
									{new Date(evento.fechaEvento).toLocaleDateString("es-ES")}
								</option>
							))}
						</select>
					</div>

					{this.state.filtroEvento && (
						<div className="mat-form-group">
							<label>Filtrar por Actividad:</label>
							<select
								value={this.state.filtroActividad}
								onChange={(e) => {
									const idActividad = e.target.value;
									this.setState({ filtroActividad: idActividad });
									this.aplicarFiltroActividad(
										this.state.filtroEvento,
										idActividad,
									);
								}}
							>
								<option value="">Todas las actividades</option>
								{this.state.actividadesFiltroLista.map((actividad) => (
									<option
										key={actividad.idActividad}
										value={actividad.idActividad}
									>
										{actividad.nombreActividad}
									</option>
								))}
							</select>
						</div>
					)}
				</div>

				{materiales.length === 0 ? (
					<div className="sin-materiales">No hay materiales registrados</div>
				) : (
					<div className="materiales-grid">
						{materiales
							.filter((item) => {
								if (this.state.filtroEstado === "todos") return true;
								if (this.state.filtroEstado === "pendientes")
									return item.material.pendiente === true;
								if (this.state.filtroEstado === "aportados")
									return item.material.pendiente === false;
								return true;
							})
							.map((item) => {
								const { material, usuarioMaterial, usuarioAportacionMaterial } =
									item;
								return (
									<div
										key={material.idMaterial}
										className={`material-card ${material.pendiente ? "pendiente" : "aportado"}`}
									>
										<div className="material-header">
											<h3>{material.nombreMaterial}</h3>
											<span
												className={`estado ${material.pendiente ? "pendiente" : "aportado"}`}
											>
												{material.pendiente ? (
													<>
														<FaClock /> Pendiente
													</>
												) : (
													<>
														<FaCheckCircle /> Aportado
													</>
												)}
											</span>
										</div>

										<div className="material-body">
											<div className="material-info">
												<span className="label">Solicitado por:</span>
												<span className="valor">
													{usuarioMaterial
														? usuarioMaterial.usuario
														: `Usuario ${material.idUsuario}`}
												</span>
											</div>

											<div className="material-info">
												<span className="label">Fecha solicitud:</span>
												<span className="valor">
													{this.formatearFecha(material.fechaSolicitud)}
												</span>
											</div>

											{!material.pendiente && usuarioAportacionMaterial && (
												<div className="material-info">
													<span className="label">Aportado por:</span>
													<span className="valor">
														{usuarioAportacionMaterial.usuario}
													</span>
												</div>
											)}
										</div>

										<div className="material-footer">
											{material.pendiente && (
												<button
													className="btn-aportar"
													onClick={() => this.abrirModalAportar(material)}
												>
													Aportar Material
												</button>
											)}
										</div>
									</div>
								);
							})}
					</div>
				)}

				{/* Modal Solicitar Material */}
				{mostrarModalSolicitar && (
					<div
						className="mat-modal-overlay"
						onClick={this.cerrarModalSolicitar}
					>
						<div
							className="mat-modal-content"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="mat-modal-header">
								<h2>Solicitar Material</h2>
								<button
									className="mat-close-btn"
									onClick={this.cerrarModalSolicitar}
								>
									<FaTimes />
								</button>
							</div>

							<div className="mat-modal-body">
								<div className="mat-form-group">
									<label>Nombre del Material *</label>
									<input
										type="text"
										value={this.state.nombreMaterial}
										onChange={(e) =>
											this.setState({ nombreMaterial: e.target.value })
										}
										placeholder="Ej: Balón, Cono de tráfico..."
									/>
								</div>

								<div className="mat-form-group">
									<label>Evento *</label>
									<select
										value={this.state.idEventoModal}
										onChange={(e) => {
											const idEvento = e.target.value;
											this.setState({ idEventoModal: idEvento });
											this.obtenerActividadesPorEvento(idEvento);
										}}
									>
										<option value="">Selecciona un evento</option>
										{this.state.eventosLista.map((evento) => (
											<option key={evento.idEvento} value={evento.idEvento}>
												Evento {evento.idEvento} -{" "}
												{new Date(evento.fechaEvento).toLocaleDateString(
													"es-ES",
												)}
											</option>
										))}
									</select>
								</div>

								{this.state.idEventoModal && (
									<div className="mat-form-group">
										<label>Actividad *</label>
										<select
											value={this.state.idActividadModal}
											onChange={(e) =>
												this.setState({ idActividadModal: e.target.value })
											}
										>
											<option value="">Selecciona una actividad</option>
											{this.state.actividadesLista.map((actividad) => (
												<option
													key={actividad.idActividad}
													value={actividad.idActividad}
												>
													{actividad.nombreActividad}
												</option>
											))}
										</select>
									</div>
								)}
							</div>

							<div className="mat-modal-footer">
								<button
									className="mat-btn-cancelar"
									onClick={this.cerrarModalSolicitar}
								>
									Cancelar
								</button>
								<button
									className="mat-btn-confirmar"
									onClick={this.solicitarMaterial}
								>
									Solicitar
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Modal Aportar Material */}
				{mostrarModalAportar && materialSeleccionado && (
					<div className="mat-modal-overlay" onClick={this.cerrarModalAportar}>
						<div
							className="mat-modal-content"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="mat-modal-header">
								<h2>Aportar Material</h2>
								<button
									className="mat-close-btn"
									onClick={this.cerrarModalAportar}
								>
									<FaTimes />
								</button>
							</div>

							<div className="mat-modal-body">
								<div className="mat-form-group">
									<label>Material a aportar:</label>
									<p className="material-info-modal">
										<strong>{materialSeleccionado.nombreMaterial}</strong>
									</p>
								</div>

								<div className="mat-form-group">
									<label>Fecha solicitado:</label>
									<p className="material-info-modal">
										{this.formatearFecha(materialSeleccionado.fechaSolicitud)}
									</p>
								</div>
							</div>

							<div className="mat-modal-footer">
								<button
									className="mat-btn-cancelar"
									onClick={this.cerrarModalAportar}
								>
									Cancelar
								</button>
								<button
									className="mat-btn-confirmar"
									onClick={this.aportarMaterial}
								>
									Confirmar Aportación
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		);
	}
}

export default MaterialesSolicitadosComponent;

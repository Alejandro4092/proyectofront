import React, { Component } from "react";
import axios from "axios";
import { Link, NavLink } from "react-router-dom";
import Global from "../Global";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";
import "../css/EventosComponent.css";
import EventosService from "../services/EventosService";
import ProfesEventosService from "../services/ProfesEventosService";

const serviceEventos = new EventosService();
const serviceProfesEventos = new ProfesEventosService();

export class EventosComponent extends Component {
	static contextType = AuthContext;

	url = Global.apiDeportes;
	state = {
		eventos: [],
		eventosCursoEscolar: [],
		eventoById: null,
		loading: true,
		eventosApuntado: [],
	};

	componentDidMount() {
		this.loadEventosCursoEscolar();
	}

	// GET: Obtiene eventos del curso escolar
	loadEventosCursoEscolar = () => {
		this.setState({ loading: true });
		let token = this.context.token;
		serviceEventos
			.getEventosCursoEscolar(token)
			.then((data) => {
				this.setState({
					eventosCursoEscolar: data,
					loading: false,
				});
				// Verificar en qué eventos está apuntado el profesor
				if (this.context.esProfesor && this.context.usuario) {
					this.verificarEventosApuntado(data);
				}
			})
			.catch((error) => {
				console.error("Error al cargar eventos:", error);
				this.setState({ loading: false });
			});
	};

	// Verifica en qué eventos el profesor está apuntado
	verificarEventosApuntado = (eventos) => {
		const idProfesor = this.context.usuario.idUsuario;
		const eventosApuntado = eventos
			.filter(evento => evento.idProfesor === idProfesor)
			.map(evento => evento.idEvento);
		this.setState({ eventosApuntado });
	};

	// DELETE: Elimina un evento con confirmación
	deleteEvento = (id) => {
		Swal.fire({
			title: "¿Eliminar evento?",
			text: "¿Estás seguro de que deseas eliminar este evento?",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#e74c3c",
			cancelButtonColor: "#6c757d",
			confirmButtonText: "Eliminar",
			cancelButtonText: "Cancelar",
			reverseButtons: true,
		}).then((result) => {
			if (result.isConfirmed) {
				this.confirmarEliminar(id);
			}
		});
	};

	confirmarEliminar = (id) => {
		if (!this.context.logeado) {
			Swal.fire({
				title: "No has iniciado sesión",
				text: "Debes iniciar sesión para eliminar un evento",
				icon: "warning",
				confirmButtonText: "Entendido",
			});
			return;
		}
		let token = this.context.token;
		serviceEventos
			.eliminarEvento(id, token)
			.then((data) => {
				Swal.fire({
					title: "Eliminado",
					text: "Evento eliminado exitosamente",
					icon: "success",
					timer: 1500,
					showConfirmButton: false,
				});
				this.loadEventosCursoEscolar();
			})
			.catch((error) => {
				Swal.fire({
					title: "Error",
					text:
						error.response?.status === 403
							? "No tienes permisos para eliminar este evento. Verifica que tu usuario tenga rol de administrador."
							: "Error al eliminar el evento: " +
								(error.response?.data || error.message),
					icon: "error",
					confirmButtonText: "Entendido",
				});
			});
	};

	// POST: Asocia al profesor actual al evento
	apuntarseEvento = (idEvento) => {
		Swal.fire({
			title: "¿Apuntarte al evento?",
			text: "¿Deseas apuntarte como profesor de este evento?",
			icon: "question",
			showCancelButton: true,
			confirmButtonColor: "#3085d6",
			cancelButtonColor: "#6c757d",
			confirmButtonText: "Apuntarme",
			cancelButtonText: "Cancelar",
			reverseButtons: true,
		}).then((result) => {
			if (result.isConfirmed) {
				this.confirmarApuntarse(idEvento);
			}
		});
	};

	confirmarApuntarse = (idEvento) => {
		if (!this.context.logeado) {
			Swal.fire({
				title: "No has iniciado sesión",
				text: "Debes iniciar sesión para apuntarte a un evento",
				icon: "warning",
				confirmButtonText: "Entendido",
			});
			return;
		}

		const token = this.context.token;
		const idProfesor = this.context.user.idUsuario;

		serviceProfesEventos
			.asociarProfesorEvento(idEvento, idProfesor, token)
			.then((data) => {
				// Actualizar el estado para marcar este evento como apuntado
				this.setState({
					eventosApuntado: [...this.state.eventosApuntado, idEvento]
				});
				Swal.fire({
					title: "¡Apuntado!",
					text: "Te has apuntado exitosamente al evento",
					icon: "success",
					timer: 1500,
					showConfirmButton: false,
				});
				this.loadEventosCursoEscolar();
			})
			.catch((error) => {
				Swal.fire({
					title: "Error",
					text:
						error.response?.status === 403
							? "No tienes permisos para apuntarte a este evento."
							: "Error al apuntarte al evento: " +
								(error.response?.data || error.message),
					icon: "error",
					confirmButtonText: "Entendido",
				});
			});
	};

	formatearFecha = (fecha) => {
		const opciones = {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		};
		return new Date(fecha).toLocaleDateString("es-ES", opciones);
	};

	render() {
		const { eventosCursoEscolar, loading } = this.state;

		return (
			<div className="eventos-container">
				<div className="eventos-header">
					<h1>Eventos</h1>
					{this.context.esOrganizador && (
						<div className="eventos-actions">
							<NavLink to="/crear-evento" className="btn-crear-evento">
								+ Crear Evento
							</NavLink>
							<NavLink to="/crear-actividad" className="btn-crear-evento">
								+ Crear Actividad
							</NavLink>
						</div>
					)}
				</div>

				{loading ? (
					<div className="loading-container">
						<div className="spinner"></div>
						<p>Cargando eventos...</p>
					</div>
				) : (
					<div className="eventos-grid">
						{eventosCursoEscolar && eventosCursoEscolar.length > 0 ? (
							eventosCursoEscolar.map((evento) => (
								<NavLink
									to={`/actividades/${evento.idEvento}`}
									key={evento.idEvento}
									className="evento-card"
									style={{ textDecoration: "none", color: "inherit" }}
								>
									<div className="evento-card-header">
										<h3>Evento #{evento.idEvento}</h3>
									</div>
									<div className="evento-card-body">
										<div className="evento-info">
											<p className="evento-label">Fecha:</p>
											<p className="evento-valor">
												{this.formatearFecha(evento.fechaEvento)}
											</p>
										</div>
									</div>
									<div className="evento-card-footer">
										{this.context.esOrganizador ? (
											<>
												<NavLink
													to={`/editar-evento/${evento.idEvento}`}
													className="btn-editar"
													onClick={(e) => e.stopPropagation()}
												>
													Editar
												</NavLink>
												<button
													className="btn-eliminar"
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														this.deleteEvento(evento.idEvento);
													}}
												>
													Eliminar
												</button>
											</>
										) : this.context.esProfesor ? (
											this.state.eventosApuntado.includes(evento.idEvento) ? (
												<button
													className="btn-apuntado"
													disabled
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
													}}
												>
													✓ Apuntado
												</button>
											) : (
												<button
													className="btn-apuntarse"
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														this.apuntarseEvento(evento.idEvento);
													}}
												>
													📋 Apuntarme
												</button>
											)
										) : null}
									</div>
								</NavLink>
							))
						) : (
							<div className="no-eventos">
								<p>No hay eventos disponibles</p>
							</div>
						)}
					</div>
				)}
			</div>
		);
	}
}

export default EventosComponent;

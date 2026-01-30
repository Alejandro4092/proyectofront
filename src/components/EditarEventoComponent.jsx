import React, { Component } from "react";
import { Link, NavLink, Navigate, useNavigate } from "react-router-dom";
import Global from "../Global";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";
import "../css/CrearEventoComponent.css";
import EventosService from "../services/EventosService";

const serviceEventos = new EventosService();

export class EditarEventoComponent extends Component {
	static contextType = AuthContext;

	url = Global.apiDeportes;
	state = {
		idEvento: null,
		fecha: "",
		mensaje: null,
		cargando: true,
		error: null,
		redirectToHome: false,
	};

	loadEvento = () => {
		let token = this.context.token;
		var idEvento = this.props.idEvento;
		serviceEventos
			.getEvento(idEvento, token)
			.then((evento) => {
				const fechaEvento = new Date(evento.fechaEvento);
				const fechaFormateada = fechaEvento.toISOString().slice(0, 16);
				this.setState({
					idEvento: idEvento,
					fecha: fechaFormateada,
					cargando: false,
				});
			})
			.catch((error) => {
				// Error handled
				this.setState({
					error: "Error al cargar el evento",
					cargando: false,
				});
			});
	};

	componentDidMount = () => {
		// Verificar que el usuario sea organizador
		if (!this.context.esOrganizador) {
			this.setState({ redirectToHome: true });
			return;
		}
		this.loadEvento();
	};

	// PUT: Modifica un evento
	updateEvento = () => {
		if (!this.context.logeado) {
			Swal.fire({
				title: "No has iniciado sesión",
				text: "Debes iniciar sesión para editar un evento",
				icon: "warning",
				confirmButtonText: "Entendido",
			});
			return;
		}
		let token = this.context.token;
		const { idEvento, fecha } = this.state;
		const fechaFormato = new Date(fecha).toISOString();

		const eventoActualizado = {
			idEvento: parseInt(idEvento),
			fechaEvento: fechaFormato,
			idProfesor: 0,
		};

		serviceEventos
			.actualizarEvento(eventoActualizado, token)
			.then((data) => {
				this.setState({
					mensaje: "Evento actualizado exitosamente",
				});
				setTimeout(() => {
					this.props.navigate("/eventos");
				}, 1500);
			})
			.catch((error) => {
				// Error handled
				Swal.fire({
					title: "Error",
					text: "No se pudo actualizar el evento",
					icon: "error",
					confirmButtonText: "Entendido",
				});
			});
	};

	handleChange = (e) => {
		this.setState({
			fecha: e.target.value,
		});
	};

	handleSubmit = (e) => {
		e.preventDefault();
		if (this.state.fecha) {
			this.updateEvento();
		}
	};

	render() {
		const { fecha, mensaje, cargando, error, redirectToHome } = this.state;

		if (redirectToHome) {
			return <Navigate to="/" replace />;
		}

		if (cargando) {
			return (
				<div className="crear-evento-container">
					<p>Cargando evento...</p>
				</div>
			);
		}

		if (error) {
			return (
				<div className="crear-evento-container">
					<div className="mensaje-error">{error}</div>
					<NavLink to="/eventos" className="btn-volver">
						← Volver
					</NavLink>
				</div>
			);
		}

		return (
			<div className="crear-evento-container">
				<div className="crear-evento-wrapper">
					<div className="crear-evento-header">
						<h1>Editar Evento</h1>
						<NavLink to="/eventos" className="btn-volver">
							← Volver
						</NavLink>
					</div>

					{mensaje && <div className="mensaje-exito">{mensaje}</div>}

					{!mensaje && (
						<form onSubmit={this.handleSubmit} className="evento-form">
							<div className="form-group">
								<label htmlFor="fecha">Fecha del Evento *</label>
								<input
									type="datetime-local"
									id="fecha"
									value={fecha}
									onChange={this.handleChange}
									required
									className="form-input"
								/>
								<small className="form-help">
									Modifica la fecha y hora del evento
								</small>
							</div>

							<div className="form-actions">
								<button type="submit" className="crear-evento-btn-crear">
									Actualizar Evento
								</button>
								<NavLink to="/eventos" className="crear-evento-btn-cancelar">
									Cancelar
								</NavLink>
							</div>
						</form>
					)}
				</div>
			</div>
		);
	}
}

export function EditarEventoWrapper(props) {
	const navigate = useNavigate();
	return <EditarEventoComponent {...props} navigate={navigate} />;
}

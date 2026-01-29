import React, { Component } from "react";
import { Link, NavLink, Navigate, useNavigate } from "react-router-dom";
import Global from "../Global";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";
import "../css/CrearEventoComponent.css";
import EventosService from "../services/EventosService";

const serviceEventos = new EventosService();

export class CrearEventoComponent extends Component {
	static contextType = AuthContext;

	url = Global.apiDeportes;
	state = {
		fecha: "",
		mensaje: null,
		redirectToHome: false,
	};

	componentDidMount = () => {
		// Verificar que el usuario sea organizador
		if (!this.context.esOrganizador) {
			this.setState({ redirectToHome: true });
		}
	};

	// POST: Crea un nuevo evento
	createEvento = (fecha) => {
		if (!this.context.logeado) {
			Swal.fire({
				title: "No has iniciado sesión",
				text: "Debes iniciar sesión para crear un evento",
				icon: "warning",
				confirmButtonText: "Entendido",
			});
			return;
		}
		let token = this.context.token;
		// El datetime-local devuelve formato "YYYY-MM-DDTHH:mm"
		const fechaConSegundos = fecha + ":00";
		const fechaLocal = new Date(fechaConSegundos);
		const fechaFormato = fechaLocal
			.toLocaleString("es-ES", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				hour12: false,
			})
			.replace(
				/(\d+)\/(\d+)\/(\d+),?\s+(\d+):(\d+):(\d+)/,
				"$3-$2-$1 $4:$5:$6",
			);

		serviceEventos.crearEvento(fechaFormato, token).then((response) => {
			console.log(response.data);
			this.setState({
				mensaje: "Evento creado exitosamente",
			});
			setTimeout(() => {
				this.props.navigate("/eventos");
			}, 1500);
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
			this.createEvento(this.state.fecha);
		}
	};

	render() {
		const { fecha, mensaje, redirectToHome } = this.state;

		if (redirectToHome) {
			return <Navigate to="/" replace />;
		}

		return (
			<div className="crear-evento-container">
				<div className="crear-evento-wrapper">
					<div className="crear-evento-header">
						<h1>Crear Nuevo Evento</h1>
						<NavLink to="/eventos" className="btn-volver">
							← Volver
						</NavLink>
					</div>

					{mensaje && <div className="mensaje-exito">{mensaje}</div>}

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
								Selecciona la fecha y hora del evento
							</small>
						</div>

						<div className="form-actions">
							<button type="submit" className="crear-evento-btn-crear">
								Crear Evento
							</button>
							<NavLink to="/eventos" className="crear-evento-btn-cancelar">
								Cancelar
							</NavLink>
						</div>
					</form>
				</div>
			</div>
		);
	}
}

// Wrapper funcional para usar useNavigate
export function CrearEventoWrapper() {
	const navigate = useNavigate();
	return <CrearEventoComponent navigate={navigate} />;
}

export default CrearEventoWrapper;

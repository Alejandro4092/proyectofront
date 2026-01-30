import React, { Component } from "react";
import { AuthContext } from "../context/AuthContext";
import "../css/PerfilComponent.css";
import Global from "../Global";
import { NavLink } from "react-router-dom";
import CapitanService from "../services/CapitanService";
import ActividadesService from "../services/ActividadesService";
import {
	FaUser,
	FaEnvelope,
	FaUserTag,
	FaGraduationCap,
	FaCrown,
	FaTasks,
	FaCalendarAlt,
} from "react-icons/fa";

const serviceCapitan = new CapitanService();
const serviceActividades = new ActividadesService();

export class PerfilComponent extends Component {
	static contextType = AuthContext;
	url = Global.apiDeportes;

	state = {
		actividades: [],
		actividadesCapitan: [],
		esCapitan: false,
	};

	componentDidMount = async () => {
		await this.loadActividadesUsuario();
		await this.checkCapitan();
	};

	checkCapitan = async () => {
		let token = this.context.token;
		try {
			const capitanes = await serviceCapitan.getCapitanes(token);
			const actividadesCapitan = [];
			this.state.actividades.forEach((actividad) => {
				capitanes.forEach((capitan) => {
					if (actividad.idEventoActividad == capitan.idEventoActividad) {
						actividadesCapitan.push(actividad.idEventoActividad);
					}
				});
			});
			this.setState({
				actividadesCapitan: actividadesCapitan,
			});
		} catch (error) {
			// Error handling
		}
	};

	esCapitanActividad = (idEventoActividad) => {
		return this.state.actividadesCapitan.includes(idEventoActividad);
	};

	loadActividadesUsuario = async () => {
		let token = this.context.token;
		try {
			const actividades = await serviceActividades.getActividadesUsuario(token);
			this.setState({
				actividades: actividades,
			});
		} catch (error) {
			// Error handling
		}
	};

	formatearFecha = (fechaStr) => {
		if (!fechaStr) return "No especificada";
		const fecha = new Date(fechaStr);
		const opciones = { day: "2-digit", month: "2-digit", year: "numeric" };
		return fecha.toLocaleDateString("es-ES", opciones);
	};

	render() {
		const { usuario } = this.context;

		if (!usuario) {
			return (
				<div className="perfil-container">
					<div className="perfil-error">
						<h2>No hay información de usuario disponible</h2>
						<p>Por favor, inicia sesión para ver tu perfil.</p>
					</div>
				</div>
			);
		}

		return (
			<div className="perfil-container">
				<div className="perfil-card">
					<div className="perfil-header">
						<h1>
							<FaUser /> Mi Perfil
						</h1>
					</div>

					<div className="perfil-content">
						<div className="perfil-imagen-section">
							{usuario.imagen ? (
								<img
									src={usuario.imagen}
									alt={`${usuario.nombre} ${usuario.apellidos}`}
									className="perfil-imagen"
								/>
							) : (
								<div className="perfil-imagen-placeholder">
									<span className="perfil-initials">
										{usuario.nombre && usuario.nombre.charAt(0)}
										{usuario.apellidos && usuario.apellidos.charAt(0)}
									</span>
								</div>
							)}
						</div>

						<div className="perfil-info">
							<div className="perfil-info-item">
								<label>
									<FaUser /> Nombre
								</label>
								<p>{usuario.nombre || "No especificado"}</p>
							</div>

							<div className="perfil-info-item">
								<label>
									<FaUser /> Apellidos
								</label>
								<p>{usuario.apellidos || "No especificado"}</p>
							</div>

							<div className="perfil-info-item">
								<label>
									<FaEnvelope /> Email
								</label>
								<p>{usuario.email || "No especificado"}</p>
							</div>

							<div className="perfil-info-item">
								<label>
									<FaUserTag /> Rol
								</label>
								<p className="perfil-rol">
									{usuario.role || "No especificado"}
								</p>
							</div>

							<div className="perfil-info-item">
								<label>
									<FaGraduationCap /> Curso
								</label>
								<p>{usuario.curso || "No especificado"}</p>
							</div>
						</div>
					</div>
				</div>

				<div className="actividades-card">
					<div className="actividades-header">
						<h2>
							<FaTasks /> Mis Actividades
						</h2>
					</div>
					<div className="actividades-content">
						{this.state.actividades.map((actividad) => {
							return (
								<NavLink
									to={`/equipos/${actividad.idEvento}/${actividad.idActividad}`}
									key={actividad.idEventoActividad}
									style={{ textDecoration: "none", color: "inherit" }}
								>
									<div className="actividad-item">
										{/* <div className="actividad-icon"></div> */}
										<div className="actividad-info">
											<h3>{actividad.nombreActividad}</h3>
											<p className="actividad-fecha inscripcion">
												<FaCalendarAlt />
												Inscrito desde:{" "}
												{this.formatearFecha(actividad.fechaInscripcion)}
											</p>
											<p className="actividad-fecha evento">
												<FaCalendarAlt />
												Fecha del Evento:{" "}
												{this.formatearFecha(actividad.fechaEvento)}
											</p>
											<div className="badges-container">
												{this.esCapitanActividad(
													actividad.idEventoActividad,
												) && (
													<span className="capitan-badge es-capitan">
														<FaCrown /> Eres capitán
													</span>
												)}
												{actividad.quiereSerCapitan ? (
													<span className="capitan-badge">
														Quieres ser capitán
													</span>
												) : (
													<span className="capitan-badge no-capitan">
														<FaUser /> No quieres ser capitán
													</span>
												)}
											</div>
											{/* <span className="actividad-badge activo">Activo</span> */}
										</div>
									</div>
								</NavLink>
							);
						})}

						{/* <div className="actividad-item">
              <div className="actividad-icon">⚽</div>
              <div className="actividad-info">
                <h3>Fútbol Sala</h3>
                <p className="actividad-fecha">Inscrito desde: 10/12/2025</p>
                <span className="actividad-badge activo">Activo</span>
              </div>
            </div>

            <div className="actividad-item">
              <div className="actividad-icon">🏀</div>
              <div className="actividad-info">
                <h3>Baloncesto</h3>
                <p className="actividad-fecha">Inscrito desde: 20/11/2025</p>
                <span className="actividad-badge activo">Activo</span>
              </div>
            </div> */}
					</div>
				</div>
			</div>
		);
	}
}

export default PerfilComponent;

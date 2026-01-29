import axios from "axios";
import React, { Component } from "react";
import Global from "../Global";
import "../css/EquipoComponent.css";
import Swal from "sweetalert2";
import { AuthContext } from "../context/AuthContext";
import { NavLink } from "react-router-dom";
import EquiposService from "../services/EquiposService";
import ColorService from "../services/ColorService";
import CapitanService from "../services/CapitanService";
import InscripcionesService from "../services/InscripcionesService";
import ActividadesService from "../services/ActividadesService";
import EventosService from "../services/EventosService";

const serviceEquipos = new EquiposService();
const serviceColor = new ColorService();
const serviceCapitan = new CapitanService();
const serviceInscripciones = new InscripcionesService();
const serviceActividades = new ActividadesService();
const serviceEventos = new EventosService();
export class EquipoComponent extends Component {
	static contextType = AuthContext;

	url = Global.apiDeportes;
	state = {
		equipoCompleto: false,
		eresMiembro: false,
		eresCapitan: false,
		usuarioMiembroEquipo: {},
		equipo: {},
		fechaEvento: null,
		equipoPrueba: {
			idEquipo: 1,
			idEventoActividad: 2,
			nombreEquipo: "prueba",
			minimoJugadores: 3,
			idColor: 1,
			idCurso: 3430,
		},
		colorName: "",
		colorNamePrueba: "rojo",
		jugadores: [],
		colores: [],
		mostrarColores: false,
		partidos: [],
		jugadoresPrueba: [
			{
				idMiembroEquipo: 1,
				idEquipo: 1,
				idUsuario: 1,
			},
			{
				idMiembroEquipo: 2,
				idEquipo: 1,
				idUsuario: 2,
			},
			{
				idMiembroEquipo: 3,
				idEquipo: 1,
				idUsuario: 3,
			},
		],
	};

	componentDidMount = async () => {
		//console.log(this.getColorName(1))
		console.log(this.context.usuario);
		await this.loadEquipo();
		await this.loadColores();
		await this.loadPartidos();
		await this.findCapitan();
		await this.loadFechaEvento();
	};

	componentDidUpdate = (prevProps) => {
		// Si cambió el idEquipo, recargar los datos del equipo
		if (prevProps.idEquipo !== this.props.idEquipo) {
			this.loadEquipo();
			this.loadPartidos();
		}
	};

	loadEquipo = async () => {
		try {
			let idEquipo = this.props.idEquipo;

			const equipo = await serviceEquipos.getEquipo(idEquipo);
			const color = await this.getColorName(equipo.idColor);
			const jugadoresEquipo = await this.findJugadoresEquipo(equipo.idEquipo);
			console.log(equipo);
			this.setState(
				{
					equipo: equipo,
					colorName: color,
					jugadores: jugadoresEquipo,
				},
				() => {
					this.checkMiembro();
				},
			);
		} catch (error) {
			console.error("Error al cargar equipo:", error);
		}
	};

	findCapitan = async () => {
		if (!this.context.token) return;
		let idEventoActividad = this.state.equipo.idEventoActividad;

		let token = this.context.token;
		try {
			const capitan = await serviceCapitan.getCapitanEventoActividad(
				idEventoActividad,
				token,
			);
			console.log(capitan);
			let esCapi = false;
			if (capitan.idUsuario == this.context.usuario.idUsuario) {
				esCapi = true;
			}
			this.setState({
				eresCapitan: esCapi,
			});
		} catch (error) {
			console.error("Error al verificar capitán:", error);
		}
	};

	loadFechaEvento = async () => {
		try {
			const idEventoActividad = this.state.equipo.idEventoActividad;
			if (!idEventoActividad) return;

			// Obtener el EventoActividad que contiene el idEvento
			const eventoActividad =
				await serviceActividades.obtenerEventoActividad(idEventoActividad);

			if (!eventoActividad || !eventoActividad.idEvento) return;

			// Obtener el Evento usando el idEvento
			const evento = await serviceEventos.getEvento(
				eventoActividad.idEvento,
				this.context.token,
			);

			if (evento && evento.fechaEvento) {
				this.setState({ fechaEvento: evento.fechaEvento });
				console.log("Fecha del evento cargada:", evento.fechaEvento);
			}
		} catch (error) {
			console.error("Error al cargar fecha del evento:", error);
		}
	};

	esEventoPasado = () => {
		if (!this.state.fechaEvento) return false;
		const fechaActual = new Date();
		const fecha = new Date(this.state.fechaEvento);
		return fecha > fechaActual;
	};

	getColorName = async (idColor) => {
		try {
			const colorName = await serviceColor.getColorName(idColor);
			console.log("color", colorName);
			return colorName;
		} catch (error) {
			console.error("Error al obtener color:", error);
			return "";
		}
	};

	findJugadoresEquipo = async (idEquipo) => {
		try {
			const players = await serviceEquipos.getJugadoresEquipo(idEquipo);
			console.log("jugadores", players);
			return players;
		} catch (error) {
			console.error("Error al buscar jugadores:", error);
			return [];
		}
	};

	loadColores = async () => {
		await serviceColor
			.getColores()
			.then((data) => {
				this.setState({ colores: data });
			})
			.catch((error) => {
				console.error("Error al cargar colores:", error);
			});
	};

	toggleColores = () => {
		this.setState({ mostrarColores: !this.state.mostrarColores });
	};

	cambiarColor = (idColor, nombreColor) => {
		Swal.fire({
			title: "¿Cambiar color del equipo?",
			text: `¿Deseas cambiar el color del equipo a ${nombreColor}?`,
			icon: "question",
			showCancelButton: true,
			confirmButtonColor: "#3085d6",
			cancelButtonColor: "#d33",
			confirmButtonText: "Sí, cambiar",
			cancelButtonText: "Cancelar",
		}).then((result) => {
			if (result.isConfirmed) {
				let idEquipo = this.props.idEquipo;

				serviceEquipos
					.actualizarColorEquipo(idEquipo, idColor, this.context.token)
					.then((data) => {
						console.log("Color actualizado:", data);
						Swal.fire(
							"¡Actualizado!",
							`El color del equipo se cambió a ${nombreColor}.`,
							"success",
						);
						this.setState({
							colorName: nombreColor,
							mostrarColores: false,
						});
						// Actualizar el equipo completo
						this.loadEquipo();
					})
					.catch((error) => {
						console.error("Error al cambiar color:", error);
						this.setState({ mostrarColores: false });
						Swal.fire(
							"Error",
							error.response?.status === 404
								? "El equipo o color no fue encontrado."
								: "No se pudo cambiar el color del equipo.",
							"error",
						);
					});
			} else {
				this.setState({ mostrarColores: false });
			}
		});
	};

	checkMiembro = () => {
		let miembro = this.state.jugadores.filter(
			(jugador) =>
				jugador.usuario ==
				this.context.usuario.nombre + " " + this.context.usuario.apellidos,
		);

		if (miembro[0] != null) {
			this.setState({ eresMiembro: true, usuarioMiembroEquipo: miembro[0] });
			return true;
		} else {
			this.setState({ eresMiembro: false });
			return false;
		}
	};

	salirDelEquipo = () => {
		// Verificar si el usuario está logueado
		if (!this.context.logeado) {
			Swal.fire({
				title: "No has iniciado sesión",
				text: "Debes iniciar sesión para salir del equipo",
				icon: "warning",
				confirmButtonText: "Entendido",
			});
			return;
		}

		if (!this.state.eresMiembro) {
			Swal.fire({
				title: "No eres miembro",
				text: "Debes ser miembro para salir del equipo",
				icon: "warning",
				confirmButtonText: "Entendido",
			});
			return;
		}

		// Lógica para salir del equipo
		Swal.fire({
			title: "¿Estás seguro?",
			text: "¿Deseas salir de este equipo?",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#d33",
			cancelButtonColor: "#3085d6",
			confirmButtonText: "Sí, salir",
			cancelButtonText: "Cancelar",
		}).then((result) => {
			if (result.isConfirmed) {
				let idEquipo = this.props.idEquipo;
				let idUsuario = this.context.usuario.idUsuario;
				console.log("Equipo:", idEquipo, "Usuario:", idUsuario);

				serviceEquipos
					.salirseEquipo(idEquipo, idUsuario, this.context.token)
					.then((data) => {
						console.log("abandonado: " + data);
						Swal.fire("¡Abandonaste!", "Has salido del equipo.", "success");
						this.loadEquipo();
						console.log("Saliendo del equipo...");
					})
					.catch((error) => {
						console.error("Error al salir del equipo:", error);
						Swal.fire("Error", "No se pudo salir del equipo.", "error");
					});
				console.log("Saliendo del equipo...");
			}
		});
	};

	entrarAlEquipo = async () => {
		// Verificar si el usuario está logueado
		if (!this.context.logeado) {
			Swal.fire({
				title: "No has iniciado sesión",
				text: "Debes iniciar sesión para unirte a un equipo",
				icon: "warning",
				confirmButtonText: "Entendido",
			});
			return;
		}

		try {
			// Verificar si el usuario está inscrito en la actividad
			const idUsuario = this.context.usuario.idUsuario;
			const inscripcionesData =
				await serviceInscripciones.getInscripcionesUsuario(idUsuario);
			const inscripciones = inscripcionesData.inscripciones;

			const idEventoActividadEquipo = this.state.equipo.idEventoActividad;

			// Debug logs
			console.log("ID Usuario:", idUsuario);
			console.log("Inscripciones del usuario:", inscripciones);
			console.log("ID EventoActividad del equipo:", idEventoActividadEquipo);

			const estaInscrito = inscripciones.some((inscripcion) => {
				console.log(
					"Comparando:",
					inscripcion.idEventoActividad,
					"con",
					idEventoActividadEquipo,
				);
				return inscripcion.idEventoActividad == idEventoActividadEquipo;
			});

			console.log("¿Está inscrito?", estaInscrito);

			if (!estaInscrito) {
				Swal.fire({
					title: "No estás inscrito",
					text: "Debes estar inscrito en esta actividad para unirte al equipo",
					icon: "warning",
					confirmButtonText: "Entendido",
				});
				return;
			}

			// Lógica para entrar al equipo
			Swal.fire({
				title: "¿Unirte al equipo?",
				text: `¿Deseas unirte a ${this.state.equipo.nombreEquipo}?`,
				icon: "question",
				showCancelButton: true,
				confirmButtonColor: "#3085d6",
				cancelButtonColor: "#d33",
				confirmButtonText: "Sí, unirme",
				cancelButtonText: "Cancelar",
			}).then((result) => {
				if (result.isConfirmed) {
					let idEquipo = this.props.idEquipo;
					let token = this.context.token;
					console.log(token);

					serviceEquipos
						.apuntarseEquipo(idEquipo, token)
						.then((data) => {
							console.log("insertado: " + data);
							Swal.fire("¡Inscrito!", "Has entrado en el equipo.", "success");
							this.loadEquipo();
							console.log("Uniéndose al equipo...");
						})
						.catch((error) => {
							console.error("Error al entrar al equipo:", error);
							Swal.fire("Error", "No se pudo entrar al equipo.", "error");
						});
				}
			});
		} catch (error) {
			console.error("Error al verificar inscripción:", error);
			Swal.fire({
				title: "Error",
				text: "No se pudo verificar tu inscripción. Por favor, intenta de nuevo.",
				icon: "error",
				confirmButtonText: "Entendido",
			});
		}
	};

	expulsarJugador = (idMiembroEquipo) => {
		if (!this.context.logeado) {
			Swal.fire({
				title: "No has iniciado sesión",
				text: "Debes iniciar sesión para expulsar jugadores",
				icon: "warning",
				confirmButtonText: "Entendido",
			});
			return;
		}

		//solo capitan
		Swal.fire({
			title: "¿Estás seguro?",
			text: "¿Deseas expulsar a este jugador del equipo?",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#d33",
			cancelButtonColor: "#3085d6",
			confirmButtonText: "Sí, expulsar",
			cancelButtonText: "Cancelar",
		}).then((result) => {
			if (result.isConfirmed) {
				serviceEquipos
					.expulsarJugador(idMiembroEquipo, this.context.token)
					.then((data) => {
						console.log("borrado", data);
						Swal.fire(
							"¡Expulsado!",
							"El jugador ha sido expulsado del equipo.",
							"success",
						);
						this.loadEquipo();
					})
					.catch((error) => {
						console.error("Error al expulsar jugador:", error);
						Swal.fire(
							"Error",
							"No se pudo expulsar al jugador del equipo.",
							"error",
						);
					});
			}
		});
	};

	getEquipoById = async (idEquipo) => {
		try {
			const equipo = await serviceEquipos.getEquipo(idEquipo);
			return equipo;
		} catch (error) {
			console.error("Error al obtener equipo:", error);
			return { nombreEquipo: "Equipo no encontrado", idEquipo: idEquipo };
		}
	};

	loadPartidos = async () => {
		try {
			let idEquipo = this.props.idEquipo;
			const partidos = await serviceEquipos.getPartidosEquipo(idEquipo);

			// Obtener los equipos completos para cada partido
			const partidosConEquipos = await Promise.all(
				partidos.map(async (partido) => {
					const equipoLocal = await this.getEquipoById(partido.idEquipoLocal);
					const equipoVisitante = await this.getEquipoById(
						partido.idEquipoVisitante,
					);
					return {
						...partido,
						equipoLocal: equipoLocal,
						equipoVisitante: equipoVisitante,
					};
				}),
			);

			this.setState({ partidos: partidosConEquipos });
			console.log("Partidos cargados:", partidosConEquipos);
		} catch (error) {
			console.error("Error al cargar partidos:", error);
			this.setState({ partidos: [] });
		}
	};

	determinarGanador = (partido) => {
		if (partido.puntosLocal > partido.puntosVisitante) {
			return "local";
		} else if (partido.puntosVisitante > partido.puntosLocal) {
			return "visitante";
		}
		return "empate";
	};

	render() {
		return (
			<div className="equipo-detail-container">
				<div className="equipo-header">
					<h1>{this.state.equipo.nombreEquipo}</h1>
				</div>

				<div className="equipo-actions">
					{!this.esEventoPasado() && (
						<>
							{this.state.eresMiembro ? (
								<button className="btn-salir" onClick={this.salirDelEquipo}>
									Salir del equipo
								</button>
							) : this.state.equipoCompleto == false ? (
								<button className="btn-entrar" onClick={this.entrarAlEquipo}>
									Entrar al equipo
								</button>
							) : (
								<h2 className="equipo-completo">Equipo completo</h2>
							)}
						</>
					)}
				</div>

				<div className="equipo-info">
					<div className="equipo-stats">
						<div className="stat-item">
							<h2>Color del Equipo:</h2>
							<div
								className={`color-badge ${this.state.eresCapitan ? "clickable" : ""}`}
								onClick={this.state.eresCapitan ? this.toggleColores : null}
								style={{
									cursor: this.state.eresCapitan ? "pointer" : "default",
								}}
							>
								{this.state.colorName}
							</div>
							{this.state.mostrarColores && (
								<div className="colores-dropdown">
									<h3>Selecciona un color:</h3>
									{this.state.colores.map((color) => (
										<div
											key={color.idColor}
											className="color-option"
											onClick={() =>
												this.cambiarColor(color.idColor, color.nombreColor)
											}
										>
											{color.nombreColor}
										</div>
									))}
								</div>
							)}
						</div>
						<div className="stat-item">
							<h2 style={{ color: "#43da7d" }}>
								Mínimo de Jugadores: {this.state.equipo.minimoJugadores}
							</h2>
							<h2>Jugadores actuales: {this.state.jugadores.length}</h2>
						</div>
					</div>
				</div>
				<div className="jugadores-section">
					<h1>Jugadores</h1>
					<div className="jugadores-grid">
						{this.state.jugadores.map((jugador, index) => {
							return (
								<div key={index} className="cardJugador">
									<h1>{jugador.usuario}</h1>
									<img
										src={
											jugador.imagen ||
											"https://cdn.pixabay.com/photo/2017/11/10/05/48/user-2935527_640.png"
										}
										alt={jugador.usuario}
									/>
									<h1 style={{ color: "#71d5f3" }}>Curso: {jugador.curso}</h1>
									{this.state.eresCapitan && (
										<button
											className="btn-expulsar"
											onClick={() =>
												this.expulsarJugador(jugador.idMiembroEquipo)
											}
										>
											Expulsar jugador
										</button>
									)}
								</div>
							);
						})}
					</div>
				</div>

				<div className="partidos-section">
					<h1>Partidos del Equipo</h1>
					{this.state.partidos && this.state.partidos.length > 0 ? (
						<div className="ec-partidos-grid">
							{this.state.partidos.map((partido, index) => {
								const ganador = this.determinarGanador(partido);

								return (
									<div
										key={partido.idPartidoResultado || index}
										className={`ec-partido-card ${ganador}`}
									>
										<div className="ec-partido-header">
											<span className="ec-evento-actividad">
												Actividad ID: {partido.idEventoActividad}
											</span>
										</div>

										<div className="ec-partido-content">
											<NavLink
												to={`/equipo/${partido.equipoLocal.idEquipo}`}
												className="ec-equipo-link"
											>
												<div
													className={`ec-equipo local ${ganador === "local" ? "ganador" : ""}`}
												>
													<div className="ec-nombre-equipo">
														{partido.equipoLocal.nombreEquipo}
													</div>
													<div className="ec-puntos-equipo">
														{partido.puntosLocal}
													</div>
												</div>
											</NavLink>

											<div className="ec-vs">VS</div>

											<NavLink
												to={`/equipo/${partido.equipoVisitante.idEquipo}`}
												className="ec-equipo-link"
											>
												<div
													className={`ec-equipo visitante ${ganador === "visitante" ? "ganador" : ""}`}
												>
													<div className="ec-nombre-equipo">
														{partido.equipoVisitante.nombreEquipo}
													</div>
													<div className="ec-puntos-equipo">
														{partido.puntosVisitante}
													</div>
												</div>
											</NavLink>
										</div>

										<div className="ec-partido-footer">
											{ganador === "empate" ? (
												<span className="ec-resultado-empate">Empate</span>
											) : (
												<span className="ec-resultado-ganador">
													{ganador === "local"
														? partido.equipoLocal.nombreEquipo
														: partido.equipoVisitante.nombreEquipo}{" "}
													gana
												</span>
											)}
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<p className="no-partidos">
							No hay partidos registrados para este equipo
						</p>
					)}
				</div>
			</div>
		);
	}
}

export default EquipoComponent;

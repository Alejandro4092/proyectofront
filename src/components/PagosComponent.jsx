import React, { Component } from "react";
import AuthContext from "../context/AuthContext";
import PagosService from "../services/PagosService";
import GestionEventoService from "../services/GestionEventoService";
import PrecioActividadService from "../services/PrecioActividadService";
import TablaPagosAgrupadosComponent from "./TablaPagosAgrupadosComponent";
import Swal from "sweetalert2";
import "../css/PagosComponent.css";

const servicePagos = new PagosService();
const serviceGestionEvento = new GestionEventoService();
const servicePrecioActividad = new PrecioActividadService();

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
	};

	componentDidMount = async () => {
		await this.loadCursos();
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

	handleCursoChange = async (e) => {
		const idCurso = parseInt(e.target.value);
		this.setState({ cursoSeleccionado: idCurso });
		await this.loadPagos(idCurso);
	};

	cambiarPestana = (pestana) => {
		this.setState({ pestanaActiva: pestana });
	};

	getPagosFiltrados = () => {
		const { pagos, pestanaActiva } = this.state;

		if (pestanaActiva === "pagados") {
			return pagos.filter(
				(pago) => pago.estado && pago.estado.toLowerCase() === "pagado",
			);
		} else {
			return pagos.filter(
				(pago) => pago.estado && pago.estado.toLowerCase() !== "pagado",
			);
		}
	};

	getPagosAgrupadosPagados = async () => {
		const { pagos } = this.state;
		const pagosPagados = pagos.filter(
			(pago) => pago.estado && pago.estado.toLowerCase() === "pagado",
		);

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
				icon: 'warning',
				title: 'Cantidad inválida',
				text: 'Por favor, ingresa una cantidad válida',
				confirmButtonColor: '#9a7fd4'
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
					icon: 'success',
					title: '¡Éxito!',
					text: 'Pago actualizado exitosamente',
					confirmButtonColor: '#9a7fd4'
				});
			} else {
				await servicePagos.crearPago(
					pagoSeleccionado.idEventoActividad,
					cursoSeleccionado,
					cantidad,
					token,
				);
				Swal.fire({
					icon: 'success',
					title: '¡Éxito!',
					text: 'Pago registrado exitosamente',
					confirmButtonColor: '#9a7fd4'
				});
			}

			this.cerrarModalPago();
			await this.loadPagos(cursoSeleccionado);
		} catch (error) {
			// Error handled
			Swal.fire({
				icon: 'error',
				title: 'Error',
				text: 'Error al procesar el pago. Inténtalo de nuevo.',
				confirmButtonColor: '#9a7fd4'
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
				</div>

				<div className="tabs-container">
					<button
						className={`tab-button ${pestanaActiva === "pagados" ? "active" : ""}`}
						onClick={() => this.cambiarPestana("pagados")}
					>
						Actividades Pagadas
					</button>
					<button
						className={`tab-button ${pestanaActiva === "pendientes" ? "active" : ""}`}
						onClick={() => this.cambiarPestana("pendientes")}
					>
						Actividades Pendientes
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
															<>
																<button
																	className="btn-pagar"
																	onClick={() =>
																		this.abrirModalPago(pago, false)
																	}
																>
																	Pagar
																</button>
																<button
																	className="pagos-btn-editar"
																	onClick={() =>
																		this.abrirModalPago(pago, true)
																	}
																>
																	Editar
																</button>
															</>
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
								&times;
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
			</div>
		);
	}
}

export default PagosComponent;

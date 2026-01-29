import React, { Component } from "react";

export class TablaPagosAgrupadosComponent extends Component {
	state = {
		pagosAgrupados: [],
		cargando: true,
	};

	async componentDidMount() {
		const pagosAgrupados = await this.props.getPagosAgrupados();
		this.setState({ pagosAgrupados, cargando: false });
	}

	async componentDidUpdate(prevProps) {
		if (this.props !== prevProps) {
			this.setState({ cargando: true });
			const pagosAgrupados = await this.props.getPagosAgrupados();
			this.setState({ pagosAgrupados, cargando: false });
		}
	}

	render() {
		const { cargando, pagosAgrupados } = this.state;
		const { formatearFecha } = this.props;

		if (cargando) {
			return (
				<div className="empty-state">
					<div className="empty-state-icon">⏳</div>
					<p className="empty-state-text">Procesando pagos...</p>
				</div>
			);
		}

		return (
			<div className="pagos-table-container">
				<table className="pagos-table">
					<thead>
						<tr>
							<th>Evento</th>
							<th>Fecha Evento</th>
							<th>Actividad</th>
							<th>Curso</th>
							<th>Precio Real</th>
							<th>Total Pagado</th>
							<th>Nº Pagos</th>
							<th>Estado</th>
						</tr>
					</thead>
					<tbody>
						{pagosAgrupados.map((pago) => (
							<tr key={pago.idEventoActividad}>
								<td>{pago.idEvento}</td>
								<td>{formatearFecha(pago.fechaEvento)}</td>
								<td>{pago.actividad || "-"}</td>
								<td>{pago.curso || "-"}</td>
								<td>{pago.precioReal || pago.precioTotal}€</td>
								<td>{pago.totalPagado}€</td>
								<td>{pago.numPagos}</td>
								<td>
									<span className="estado-badge estado-pagado">Pagado</span>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	}
}

export default TablaPagosAgrupadosComponent;

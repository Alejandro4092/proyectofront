import axios from 'axios'
import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import Global from '../Global'
import '../css/Home.css'
import AuthContext from '../context/AuthContext'

export class Home extends Component {
  static contextType = AuthContext;
  
  constructor(props) {
    super(props);
    this.url = Global.apiDeportes;
    this.state = {
      eventos: [],
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear(),
      selectedDate: null,
      eventosDelDia: []
    };
  }

  componentDidMount() {
    this.loadEventos();
  }

  loadEventos = () => {
    let request = "api/Eventos/EventosCursoEscolar";
    axios.get(this.url + request).then(response => {
      this.setState({
        eventos: response.data
      });
    });
  }

  getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  }

  getFirstDayOfMonth = (month, year) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Convertir domingo (0) a 6, lunes (1) a 0, etc.
  }

  getEventosForDay = (day, month, year) => {
    return this.state.eventos.filter(evento => {
      const fechaEvento = new Date(evento.fechaEvento);
      return fechaEvento.getDate() === day && 
             fechaEvento.getMonth() === month && 
             fechaEvento.getFullYear() === year;
    });
  }

  handleDayClick = (day) => {
    const eventosDelDia = this.getEventosForDay(day, this.state.currentMonth, this.state.currentYear);
    this.setState({
      selectedDate: day,
      eventosDelDia: eventosDelDia
    });
  }

  changeMonth = (direction) => {
    let newMonth = this.state.currentMonth + direction;
    let newYear = this.state.currentYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }

    this.setState({
      currentMonth: newMonth,
      currentYear: newYear,
      selectedDate: null,
      eventosDelDia: []
    });
  }

  formatearFecha = (fecha) => {
    const opciones = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(fecha).toLocaleDateString('es-ES', opciones);
  }

  renderCalendar = () => {
    const { currentMonth, currentYear } = this.state;
    const daysInMonth = this.getDaysInMonth(currentMonth, currentYear);
    const firstDay = this.getFirstDayOfMonth(currentMonth, currentYear);
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    const days = [];
    
    // Días vacíos al inicio
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const eventosDelDia = this.getEventosForDay(day, currentMonth, currentYear);
      const hasEvents = eventosDelDia.length > 0;
      const isSelected = this.state.selectedDate === day;
      const isToday = day === new Date().getDate() && 
                      currentMonth === new Date().getMonth() && 
                      currentYear === new Date().getFullYear();

      days.push(
        <div
          key={day}
          className={`calendar-day ${hasEvents ? 'has-events' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
          onClick={() => this.handleDayClick(day)}
        >
          <span className="day-number">{day}</span>
        </div>
      );
    }

    return (
      <div className="calendar">
        <div className="calendar-header">
          <button onClick={() => this.changeMonth(-1)} className="month-btn">&lt;</button>
          <h2>{monthNames[currentMonth]} {currentYear}</h2>
          <button onClick={() => this.changeMonth(1)} className="month-btn">&gt;</button>
        </div>
        <div className="calendar-days-header">
          {dayNames.map(name => (
            <div key={name} className="day-name">{name}</div>
          ))}
        </div>
        <div className="calendar-grid">
          {days}
        </div>
      </div>
    );
  }

  render() {
    const { eventosDelDia, selectedDate, currentMonth, currentYear } = this.state;
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return (
      <div className="home-container">
        <h1>Calendario de Eventos Deportivos</h1>
        
        {this.renderCalendar()}

        {selectedDate && (
          <div className="eventos-del-dia">
            <h3>Eventos del {selectedDate} de {monthNames[currentMonth]} de {currentYear}</h3>
            {eventosDelDia.length > 0 ? (
              <div className="eventos-lista">
                {eventosDelDia.map(evento => (
                  <div key={evento.idEvento} className="evento-item">
                    <div className="evento-item-header">
                      <span className="evento-id">Evento Deportivo</span>
                      <span className="evento-fecha">{this.formatearFecha(evento.fechaEvento)}</span>
                    </div>
                    <NavLink to={`/actividades/${evento.idEvento}`} className="btn-ver-detalle">
                      Ver detalles
                    </NavLink>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-eventos">No hay eventos programados para este día</p>
            )}
          </div>
        )}
      </div>
    )
  }
}

export default Home
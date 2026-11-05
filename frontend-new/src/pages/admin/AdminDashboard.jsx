import { useEffect, useMemo, useState } from "react";
import { loadTransportTrips } from "../../shared/services/adminTransportData";

const serviceInfo = [
  { key: "flight", name: "Flight", icon: "✈", color: "blue" },
  { key: "train", name: "Train", icon: "▤", color: "purple" },
  { key: "bus", name: "Bus", icon: "▣", color: "orange" },
];

const bookingTabs = ["All Bookings", "Flight", "Train", "Bus"];

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function AdminDashboard() {
  const [transportTrips, setTransportTrips] = useState(loadTransportTrips);
  const [activeTab, setActiveTab] = useState("All Bookings");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const refresh = () => setTransportTrips(loadTransportTrips());
    window.addEventListener("admin-transport-data-updated", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("admin-transport-data-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const allTrips = useMemo(
    () =>
      Object.entries(transportTrips).flatMap(([service, trips]) =>
        trips.map((trip) => ({ ...trip, service })),
      ),
    [transportTrips],
  );

  const visibleTrips = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const selectedService =
      activeTab === "All Bookings" ? null : activeTab.toLowerCase();

    return allTrips.filter((trip) => {
      const matchesTab = !selectedService || trip.service === selectedService;
      const matchesSearch =
        !keyword ||
        [trip.code, trip.operator, trip.departure, trip.destination].some(
          (value) => value.toLowerCase().includes(keyword),
        );
      return matchesTab && matchesSearch;
    });
  }, [activeTab, allTrips, search]);

  const metrics = useMemo(() => {
    const revenue = allTrips.reduce((sum, trip) => sum + trip.price, 0);
    const seats = allTrips.reduce((sum, trip) => sum + trip.seats, 0);
    return {
      revenue,
      bookings: allTrips.length,
      pending: allTrips.filter((trip) => trip.status !== "active").length,
      customers: seats,
    };
  }, [allTrips]);

  const revenueByService = serviceInfo.map((service) => ({
    ...service,
    value: transportTrips[service.key].reduce(
      (sum, trip) => sum + trip.price,
      0,
    ),
  }));
  const totalRevenue = revenueByService.reduce(
    (sum, service) => sum + service.value,
    0,
  );

  return (
    <main className="admin-dashboard">
      <div className="admin-welcome-row">
        <h1>Welcome to Travel Mini Admin Portal</h1>
        <button className="admin-date-button" type="button">
          <span>▦</span>
          Dữ liệu hiện tại
          <span>⌄</span>
        </button>
      </div>

      <section className="admin-metric-grid">
        <MetricCard title="Total Revenue" icon="▣" color="green" value={formatPrice(metrics.revenue)} detail="Tổng giá trị các chuyến" />
        <MetricCard title="Total Bookings" icon="▤" color="blue" value={metrics.bookings} detail="Tổng số chuyến vận tải" />
        <MetricCard title="Pending Bookings" icon="◷" color="purple" value={metrics.pending} detail="Chuyến đang ngừng hoạt động" />
        <MetricCard title="Total Customers" icon="♙" color="orange" value={metrics.customers} detail="Tổng số chỗ cung cấp" />
      </section>

      <section className="admin-report-grid">
        <article className="admin-card">
          <div className="admin-card-heading">
            <h2>Revenue Reports</h2>
            <span className="admin-growth-placeholder">Bus / Flight / Train</span>
          </div>
          <div className="admin-revenue-content">
            <div className="admin-donut">
              <div className="admin-donut-center">
                <strong>{formatPrice(totalRevenue)}</strong>
                <span>Total Revenue</span>
              </div>
            </div>
            <div className="admin-legend">
              {revenueByService.map((service) => (
                <div className="admin-legend-row" key={service.key}>
                  <span className={`admin-legend-dot ${service.color}`} />
                  <span>{service.name}</span>
                  <span className="admin-legend-value">{formatPrice(service.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="admin-card">
          <div className="admin-card-heading">
            <h2>Trips by Service</h2>
            <span className="admin-more-icon">•••</span>
          </div>
          <div className="admin-destination-list">
            {serviceInfo.map((service) => {
              const count = transportTrips[service.key].length;
              const max = Math.max(...serviceInfo.map((item) => transportTrips[item.key].length), 1);
              return (
                <div className="admin-destination-row" key={service.key}>
                  <span>{service.name}</span>
                  <div className="admin-progress-track">
                    <div className="admin-progress-fill" style={{ width: `${(count / max) * 100}%` }} />
                  </div>
                  <span className="admin-destination-value">{count} chuyến</span>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="admin-card admin-bookings-card">
        <div className="admin-booking-heading">
          <h2>Booking Management</h2>
          <div className="admin-booking-tools">
            <label className="admin-search-box">
              <span>⌕</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" aria-label="Search bookings" />
            </label>
            <button className="admin-filter-submit" type="button">Filter</button>
          </div>
        </div>
        <div className="admin-booking-tabs">
          {bookingTabs.map((tab) => (
            <button key={tab} type="button" className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>
        <div className="admin-table-scroll">
          <table className="admin-bookings-table">
            <thead>
              <tr>
                <th>Trip ID</th>
                <th>Operator</th>
                <th>Service</th>
                <th>Route</th>
                <th>Travel Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {visibleTrips.map((trip) => (
                <tr key={`${trip.service}-${trip.id}`}>
                  <td>{trip.code}</td>
                  <td>{trip.operator}</td>
                  <td><span className="admin-empty-service">{trip.service}</span></td>
                  <td>{trip.departure} → {trip.destination}</td>
                  <td>{formatDate(trip.departureTime)}</td>
                  <td>{formatPrice(trip.price)}</td>
                </tr>
              ))}
              {visibleTrips.length === 0 && (
                <tr><td colSpan="6">Chưa có dữ liệu phù hợp</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="admin-booking-footer">
          <span>{visibleTrips.length} chuyến được hiển thị</span>
          <button type="button" className="admin-view-all">Đã đồng bộ dữ liệu →</button>
        </div>
      </section>

      <section className="admin-service-section">
        <div className="admin-section-title"><h2>Bookings by Service</h2></div>
        <div className="admin-service-grid">
          {serviceInfo.map((service) => (
            <article className="admin-service-card" key={service.key}>
              <div className={`admin-service-icon ${service.color}`}>{service.icon}</div>
              <div><span>{service.name}</span><strong>{transportTrips[service.key].length}</strong></div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function MetricCard({ title, icon, color, value, detail }) {
  return (
    <article className="admin-metric-card">
      <div className={`admin-metric-icon ${color}`}>{icon}</div>
      <div className="admin-metric-info">
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}

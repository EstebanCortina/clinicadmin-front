<template>
  <v-container>
    <v-card>
      <v-card-title>
        Citas médicas
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="fetchAppointments">
          <v-icon left>mdi-refresh</v-icon>
          Actualizar
        </v-btn>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="appointments"
        :loading="loading"
        :server-items-length="totalItems"
        :items-per-page="pagination.itemsPerPage"
        :page.sync="pagination.page"
        @update:page="fetchAppointments"
        @update:items-per-page="onItemsPerPageChange"
        class="elevation-1"
        dense
        loading-text="Cargando citas..."
      >
      <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-slot:item.status="{ item }">
          <v-chip :color="statusColor(
            item.appointment_status_type_name
            )" dark>{{ item.appointment_status_type_name }}</v-chip>
        </template>
        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-slot:item.schedule_date="{ item }">
        {{ formatDateTime(item.schedule_date) }}
        </template>
        <template v-slot:no-data>
          No hay citas registradas.
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'appointments-table-com',
  data() {
    return {
      loading: false,
      appointments: [],
      totalItems: 0,
      pagination: {
        page: 1,
        itemsPerPage: 10,
      },
      headers: [
        { text: 'Paciente', value: 'patient_name' },
        { text: 'Estado', value: 'status' },
        { text: 'Tipo de Consulta', value: 'appointment_type_name' },
        { text: 'Comentarios', value: 'comments' },
        { text: 'Fecha y Hora', value: 'schedule_date' },
      ],
    };
  },
  methods: {
    async fetchAppointments() {
      this.loading = true;
      try {
        const { page, itemsPerPage } = this.pagination;
        const res = await api.get('/appointments', {
          params: {
            page,
            per_page: itemsPerPage,
          },
        });
        this.appointments = res.data.appointments.map((a) => ({
          ...a,
          patient_name: `${a.patient_name || 'N/A'} ${a.patient_last_name || ''}`,
        }));
        this.totalItems = res.data.total;
      } catch (err) {
        console.error('Error al cargar citas');
      } finally {
        this.loading = false;
      }
    },
    statusColor(status) {
      switch (status) {
        case 'Pendiente':
          return 'orange';
        case 'Realizada':
          return 'green';
        case 'Cancelada':
          return 'red';
        default:
          return 'grey';
      }
    },
    formatDateTime(utcDateStr) {
      const date = new Date(utcDateStr);
      const datePart = date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const timePart = date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      return `${datePart} - ${timePart}`;
    },
    async onItemsPerPageChange(newPerPage) {
      this.pagination.itemsPerPage = newPerPage;
      this.pagination.page = 1;
      await this.fetchAppointments();
    },
  },
  created() {
    this.fetchAppointments();
  },
};
</script>

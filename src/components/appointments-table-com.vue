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
    <v-tooltip left>
      <template v-slot:activator="{ on, attrs }">
          <v-btn
            fab
            color="primary"
            dark
            fixed
            bottom
            right
            large
            @click="openCreateDialog"
            v-bind="attrs"
            v-on="on"
            style="position: fixed; bottom: 20px; right: 20px;">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
      </template>
      <span>Crear cita</span>
    </v-tooltip>

    <v-dialog v-model="createDialog" max-width="500px">
      <v-card>
        <v-card-title>Crear Cita</v-card-title>
        <v-card-text>
          <v-select
            label="Tipo de Cita"
            :items="appointmentTypes"
            item-text="name"
            item-value="id"
            v-model="newAppointment.appointment_type_id"
            required
          />

          <v-autocomplete
            label="Buscar Paciente"
            v-model="selectedPatient"
            :items="patientOptions"
            item-text="full_name"
            item-value="id"
            :loading="patientLoading"
            :search-input.sync="patientSearch"
            @update:search-input="searchPatients"
            required
          />

          <v-menu
            v-model="menuDate"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            max-width="290px"
            min-width="290px"
          >
            <template #activator="{ on, attrs }">
              <v-text-field
                v-model="formattedDate"
                label="Fecha y Hora"
                readonly
                v-bind="attrs"
                v-on="on"
              />
            </template>
            <v-card>
              <v-date-picker v-model="date" @input="updateScheduleDate" />
              <v-time-picker v-model="time" @input="updateScheduleDate" format="24hr" />
              <v-card-actions>
                <v-spacer />
                <v-btn text color="primary" @click="confirmScheduleDate">Aceptar</v-btn>
                <v-btn text @click="menuDate = false">Cerrar</v-btn>
              </v-card-actions>
            </v-card>
          </v-menu>

          <v-textarea
            label="Comentarios"
            v-model="newAppointment.comments"
            rows="2"
          />

          <v-alert
            v-if="createError"
            type="error"
            dismissible
            class="ma-4"
            @input="createError = ''"
          >
            {{ createError }}
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="createAppointment">Crear</v-btn>
          <v-btn text @click="createDialog = false">Cancelar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>
import api from '@/services/api';
// eslint-disable-next-line
import dayjs from 'dayjs';
// eslint-disable-next-line
import utc from 'dayjs/plugin/utc';

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
      // modal
      createDialog: false,
      createError: '',
      // cita
      newAppointment: {
        appointment_type_id: null,
        patient_id: null,
        schedule_date: null,
        comments: '',
      },
      selectedPatient: null,
      appointmentTypes: [],
      // fecha y hora
      date: null,
      time: null,
      menuDate: false,
      formattedDate: '',
      // pacientes
      patientSearch: '',
      patientOptions: [],
      patientLoading: false,
      headers: [
        { text: 'Paciente', value: 'patient_name' },
        { text: 'Estado', value: 'status' },
        { text: 'Tipo de Consulta', value: 'appointment_type_name' },
        { text: 'Comentarios', value: 'comments' },
        { text: 'Fecha y Hora', value: 'schedule_date' },
      ],
    };
  },
  watch: {
    selectedPatient(val) {
      if (val) {
        this.newAppointment.patient_id = val;
      }
    },
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
    openCreateDialog() {
      this.resetForm();
      this.createDialog = true;
      this.fetchAppointmentTypes();
    },
    resetForm() {
      this.newAppointment = {
        appointment_type_id: null,
        patient_id: null,
        schedule_date: null,
        comments: '',
      };
      this.selectedPatient = null;
      this.date = null;
      this.time = null;
      this.formattedDate = '';
      this.createError = '';
    },
    async fetchAppointmentTypes() {
      try {
        const res = await api.get('/appointment-types');
        this.appointmentTypes = res.data;
      } catch (err) {
        this.createError = 'No se pudieron cargar los tipos de cita';
      }
    },
    async searchPatients() {
      if (this.patientSearch.length < 3) return;
      this.patientLoading = true;
      try {
        const res = await api.get('/patients', {
          params: { search: this.patientSearch },
        });
        this.patientOptions = res.data.map((p) => ({
          ...p,
          full_name: `${p.name} ${p.last_name}`,
        }));
      } catch (err) {
        this.createError = 'Error al buscar pacientes.';
      } finally {
        this.patientLoading = false;
      }
    },
    updateScheduleDate() {
      if (!this.date || !this.time) return;
      const combined = `${this.date} ${this.time}`;
      dayjs.extend(utc);
      const utcDate = dayjs(combined).utc().format();
      this.newAppointment.schedule_date = utcDate;
      this.formattedDate = dayjs(combined).format('DD/MM/YYYY hh:mm A');
    },
    confirmScheduleDate() {
      this.menuDate = false;
    },
    async createAppointment() {
      try {
        console.log('Creating appointment:', this.newAppointment);
        await api.post('/appointments', this.newAppointment);
        this.createDialog = false;
        this.fetchAppointments();
        this.resetForm();
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Error al crear cita.';
        this.createError = msg;
      }
    },
  },
  created() {
    this.fetchAppointments();
  },
};
</script>

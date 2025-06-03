<template>
  <v-container>
    <v-row>
      <v-col
        v-for="patient in patients"
        :key="patient.id"
        cols="12"
        sm="6"
        md="4"
      >
        <v-card @click="openEditModal(patient)" class="hoverable" outlined>
          <v-card-title>{{ patient.name }} {{ patient.last_name }}</v-card-title>
          <v-card-subtitle>{{ patient.email }}</v-card-subtitle>
          <v-card-text>{{ patient.phone }}</v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="editDialog" max-width="500px">
      <v-card>
        <v-card-title>Editar Paciente</v-card-title>
        <v-card-text>
          <v-text-field
            label="Nombre"
            v-model="selectedPatient.name"
          ></v-text-field>
          <v-text-field
            label="Apellidos"
            v-model="selectedPatient.last_name"
          ></v-text-field>
          <v-text-field
            label="Edad"
            type="number"
            v-model="selectedPatient.age"
          ></v-text-field>
          <v-text-field
            label="CURP"
            v-model="selectedPatient.national_id_number"
          ></v-text-field>
          <v-text-field
            label="Teléfono"
            v-model="selectedPatient.phone"
          ></v-text-field>
          <v-text-field
            label="Dirección"
            v-model="selectedPatient.address"
          ></v-text-field>
          <v-text-field
            label="Correo"
            v-model="selectedPatient.email"
          ></v-text-field>
          <v-text-field
            label="Grupo Sanguíneo"
            v-model="selectedPatient.blood_group"
          ></v-text-field>
          <v-text-field
            label="Sexo"
            v-model="selectedPatient.sex"
          ></v-text-field>
            <v-text-field
            label="Comentarios"
            v-model="selectedPatient.comments"
          ></v-text-field>
        </v-card-text>
        <v-alert
          v-if="errorMessage"
          type="error"
          dismissible
          class="ma-4"
          @input="errorMessage = ''"
        >
          {{ errorMessage }}
        </v-alert>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="savePatient">Guardar</v-btn>
          <v-btn text @click="editDialog = false">Cancelar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
// eslint-disable-next-line
import api from '@/services/api';

export default {
  name: 'patients-com',
  data() {
    return {
      patients: [],
      editDialog: false,
      errorMessage: '',
      selectedPatient: {},
    };
  },
  methods: {
    async fetchPatients() {
      try {
        const res = await api.get('/patients');
        this.patients = res.data;
      } catch (err) {
        console.error('Request failed:');
      }
    },
    openEditModal(patient) {
      this.selectedPatient = { ...patient }; // copiar para evitar modificar directo
      this.editDialog = true;
      this.errorMessage = '';
    },
    async savePatient() {
      try {
        await api.put(`/patients/${this.selectedPatient.id}`, this.selectedPatient);
        this.editDialog = false;
        this.fetchPatients();
      } catch (err) {
        const msg = err.response?.data?.data || err.message || 'Error al actualizar paciente.';
        this.showError(msg);
      }
    },
    showError(message) {
      this.errorMessage = message;
    },
  },
  created() {
    this.fetchPatients();
  },
};
</script>

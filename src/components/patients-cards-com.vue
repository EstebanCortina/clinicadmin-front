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
            @click="openCreateModal"
            v-bind="attrs"
            v-on="on"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
      </template>
      <span>Agregar paciente</span>
    </v-tooltip>
    <v-dialog v-model="editDialog" max-width="500px">
      <v-card>
        <v-card-title>
          {{ selectedPatient.id ? 'Editar Paciente' : 'Agregar Paciente' }}
        </v-card-title>
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
        <v-file-input
          v-if="selectedPatient.id"
          label="Subir archivo"
          accept=".pdf,.png,.jpg,.jpeg"
          @change="uploadFile"
          prepend-icon="mdi-paperclip"
          dense
          hide-details
          class="mt-2"
        ></v-file-input>
        <v-btn
          small
          color="primary"
          @click.stop="downloadFile(selectedPatient.id)"
          v-if="hasFile">
          Descargar archivo
        </v-btn>
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
import api from '@/services/api';

export default {
  name: 'patients-com',
  data() {
    return {
      patients: [],
      editDialog: false,
      errorMessage: '',
      selectedPatient: {},
      hasFile: false,
      fileUrl: null,

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
      this.selectedPatient = { ...patient };
      this.editDialog = true;
      this.errorMessage = '';
      this.checkExistingFile();
    },
    openCreateModal() {
      this.selectedPatient = {}; // limpiar para crear nuevo paciente
      this.editDialog = true;
      this.errorMessage = '';
    },
    async savePatient() {
      try {
        if (this.selectedPatient.id) {
          // Actualizar paciente
          await api.put(`/patients/${this.selectedPatient.id}`, this.selectedPatient);
        } else {
          // Crear paciente
          await api.post('/patients', this.selectedPatient);
        }
        this.editDialog = false;
        this.fetchPatients();
      } catch (err) {
        const msg = err.response?.data?.data || err.response?.data?.message || err.message || 'Error al guardar paciente.';
        this.showError(msg);
      }
    },
    showError(message) {
      this.errorMessage = message;
    },
    async checkExistingFile() {
      if (!this.selectedPatient.id) return;
      try {
        const res = await api.get(`/patients/${this.selectedPatient.id}/files/main`);
        if (res) {
          this.hasFile = true;
        } else {
          this.hasFile = false;
        }
      } catch (err) {
        this.hasFile = false;
      }
    },
    async uploadFile(file) {
      if (!file || !this.selectedPatient.id) return;

      const formData = new FormData();
      formData.append('file', file);
      try {
        await api.post(`/patients/${this.selectedPatient.id}/files`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        this.$nextTick(() => this.checkExistingFile());
      } catch (err) {
        this.showError('Error al subir archivo.');
      }
    },
    async downloadFile(patientId) {
      try {
        const res = await api.get(`/patients/${patientId}/files/main`, {
          responseType: 'arraybuffer',
        });
        const blob = new Blob([res], { type: 'application/pdf' }); // ajusta el MIME si no es PDF
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `archivo_paciente_${patientId}.pdf`);
        document.body.appendChild(link);
        link.click();

        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Error al descargar el archivo');
        this.showError('No se pudo descargar el archivo del paciente.');
      }
    },
  },
  created() {
    this.fetchPatients();
  },
};
</script>

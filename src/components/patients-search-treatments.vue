<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Gestión de Tratamientos</h1>
      </v-col>
    </v-row>

    <!-- Buscador de Pacientes -->
    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon left>mdi-account-search</v-icon>
            Buscar Paciente
          </v-card-title>
          <v-card-text>
            <v-autocomplete
              v-model="selectedPatient"
              :items="patients"
              :loading="loadingPatients"
              :search-input.sync="searchPatient"
              item-text="name"
              item-value="id"
              label="Nombre del paciente"
              prepend-icon="mdi-account"
              return-object
              clearable
              no-filter
              @change="onPatientSelected"
            >
              <template v-slot:item="{ item }">
                <v-list-item-content>
                  <v-list-item-title>{{ item.name }}</v-list-item-title>
                  <v-list-item-subtitle>ID: {{ item.id }}</v-list-item-subtitle>
                </v-list-item-content>
              </template>
              <template v-slot:no-data>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>
                      Escribe para buscar pacientes
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-autocomplete>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="selectedPatient">
      <v-col cols="12">
        <v-card>
          <v-card-title class="primary white--text">
            <v-icon left color="white">mdi-account</v-icon>
            {{ selectedPatient.name }}
            <v-spacer></v-spacer>
            <v-btn
              color="white"
              text
              @click="showAddTreatmentDialog = true"
            >
              <v-icon left>mdi-plus</v-icon>
              Agregar Tratamiento
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="treatmentHeaders"
              :items="treatments"
              :loading="loadingTreatments"
              class="elevation-1"
              loading-text="Cargando tratamientos..."
              no-data-text="No hay tratamientos registrados"
            >
            <!-- eslint-disable-next-line vue/valid-v-slot -->
              <template v-slot:item.treatment_type="{ item }">
                  {{ item.treatment_type_name }}
              </template>
              <!-- eslint-disable-next-line vue/valid-v-slot -->
              <template v-slot:item.comments="{ item }">
                  {{ item.comments || 'Sin observaciones' }}
              </template>
              <!-- eslint-disable-next-line vue/valid-v-slot -->
              <template v-slot:item.from_date="{ item }">
                {{ formatDateTime(item.from_date) }}
              </template>
              <!-- eslint-disable-next-line vue/valid-v-slot -->
              <template v-slot:item.to_date="{ item }">
                {{ formatDateTime(item.to_date) }}
              </template>
              <!-- eslint-disable-next-line vue/valid-v-slot -->
              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon
                  small
                  color="primary"
                  @click="editTreatment(item)"
                >
                  <v-icon small>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  icon
                  small
                  color="red"
                  @click="deleteTreatment(item)"
                >
                  <v-icon small>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="showAddTreatmentDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">
            {{ editingTreatment ? 'Editar' : 'Agregar' }} Tratamiento
          </span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-form ref="treatmentForm" v-model="validForm">
              <v-row>
                <v-col cols="12">
                  <v-select
                    v-model="treatmentForm.treatment_type_id"
                    :items="treatmentTypes"
                    :loading="loadingTreatmentTypes"
                    item-text="name"
                    item-value="id"
                    label="Tipo de Tratamiento"
                    :rules="[v => !!v || 'Tipo de tratamiento es requerido']"
                    required
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-menu
                    v-model="fromDateMenu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="formattedFromDate"
                        label="Fecha y Hora de Inicio"
                        prepend-icon="mdi-calendar-clock"
                        readonly
                        :rules="[v => !!treatmentForm.from_date || 'Fecha de inicio es requerida']"
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-card>
                      <v-card-text class="pa-0">
                        <v-tabs v-model="fromDateTab">
                          <v-tab>Fecha</v-tab>
                          <v-tab>Hora</v-tab>
                        </v-tabs>
                        <v-tabs-items v-model="fromDateTab">
                          <v-tab-item>
                            <v-date-picker
                              v-model="fromDateOnly"
                              @input="updateFromDate"
                              full-width
                            ></v-date-picker>
                          </v-tab-item>
                          <v-tab-item>
                            <v-time-picker
                              v-model="fromTimeOnly"
                              @input="updateFromDate"
                              format="24hr"
                              full-width
                            ></v-time-picker>
                          </v-tab-item>
                        </v-tabs-items>
                      </v-card-text>
                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn text @click="fromDateMenu = false">Cerrar</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-menu>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-menu
                    v-model="toDateMenu"
                    :close-on-content-click="false"
                    :nudge-right="40"
                    transition="scale-transition"
                    offset-y
                    min-width="290px"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="formattedToDate"
                        label="Fecha y Hora de Fin"
                        prepend-icon="mdi-calendar-clock"
                        readonly
                        :rules="[v => !!treatmentForm.to_date || 'Fecha de fin es requerida']"
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-card>
                      <v-card-text class="pa-0">
                        <v-tabs v-model="toDateTab">
                          <v-tab>Fecha</v-tab>
                          <v-tab>Hora</v-tab>
                        </v-tabs>
                        <v-tabs-items v-model="toDateTab">
                          <v-tab-item>
                            <v-date-picker
                              v-model="toDateOnly"
                              @input="updateToDate"
                              full-width
                            ></v-date-picker>
                          </v-tab-item>
                          <v-tab-item>
                            <v-time-picker
                              v-model="toTimeOnly"
                              @input="updateToDate"
                              format="24hr"
                              full-width
                            ></v-time-picker>
                          </v-tab-item>
                        </v-tabs-items>
                      </v-card-text>
                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn text @click="toDateMenu = false">Cerrar</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-menu>
                </v-col>
                <v-col cols="12">
                <v-textarea
                  v-model="treatmentForm.comments"
                  label="Observaciones / Comentarios"
                  auto-grow
                  clearable
                  rows="2"
                  counter="500"
                  maxlength="500"
                ></v-textarea>
              </v-col>
              </v-row>
            </v-form>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="closeDialog"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            :loading="savingTreatment"
            :disabled="!validForm"
            @click="saveTreatment"
          >
            {{ editingTreatment ? 'Actualizar' : 'Guardar' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de Confirmación para Eliminar -->
    <v-dialog v-model="showDeleteDialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5">
          Confirmar Eliminación
        </v-card-title>
        <v-card-text>
          ¿Estás seguro de que quieres eliminar este tratamiento?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="showDeleteDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="red darken-1"
            text
            :loading="deletingTreatment"
            @click="confirmDeleteTreatment"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar para mensajes -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
    >
      {{ snackbar.message }}
      <template v-slot:action="{ attrs }">
        <v-btn
          text
          v-bind="attrs"
          @click="snackbar.show = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import api from '@/services/api';

export default {
  name: 'TreatmentsModule',
  data() {
    return {
      patients: [],
      selectedPatient: null,
      searchPatient: '',
      loadingPatients: false,
      treatments: [],
      loadingTreatments: false,
      treatmentHeaders: [
        { text: 'Tipo de Tratamiento', value: 'treatment_type_name', sortable: false },
        { text: 'Observaciones', value: 'comments', sortable: false },
        { text: 'Fecha Inicio', value: 'from_date' },
        { text: 'Fecha Fin', value: 'to_date' },
        // eslint-disable-next-line
        { text: 'Acciones', value: 'actions', sortable: false, width: '120px' }
      ],
      treatmentTypes: [],
      loadingTreatmentTypes: false,
      showAddTreatmentDialog: false,
      editingTreatment: null,
      validForm: false,
      savingTreatment: false,
      treatmentForm: {
        treatment_type_id: null,
        from_date: '',
        to_date: '',
        comments: '',
      },
      fromDateMenu: false,
      toDateMenu: false,
      fromDateTab: 0,
      toDateTab: 0,
      fromDateOnly: '',
      fromTimeOnly: '08:00',
      toDateOnly: '',
      toTimeOnly: '09:00',
      showDeleteDialog: false,
      treatmentToDelete: null,
      deletingTreatment: false,
      snackbar: {
        show: false,
        message: '',
        color: 'success',
      },
    };
  },
  computed: {
    formattedFromDate() {
      if (!this.treatmentForm.from_date) return '';
      return this.formatDateTime(this.treatmentForm.from_date);
    },
    formattedToDate() {
      if (!this.treatmentForm.to_date) return '';
      return this.formatDateTime(this.treatmentForm.to_date);
    },
  },
  watch: {
    searchPatient(val) {
      if (val && val.length > 2) {
        this.searchPatients(val);
      }
    },
    showAddTreatmentDialog(val) {
      if (val && !this.editingTreatment) {
        this.loadTreatmentTypes();
      }
    },
  },
  methods: {
    async searchPatients(search) {
      this.loadingPatients = true;
      try {
        const response = await api.get(`/patients?search=${search}`);
        this.patients = response.data;
      } catch (error) {
        this.showMessage('Error al buscar pacientes', 'error');
        console.error('Error searching patients:');
      } finally {
        this.loadingPatients = false;
      }
    },
    async onPatientSelected(patient) {
      if (patient) {
        this.selectedPatient = patient;
        await this.loadPatientTreatments(patient.id);
      } else {
        this.selectedPatient = null;
        this.treatments = [];
      }
    },
    async loadPatientTreatments(patientId) {
      this.loadingTreatments = true;
      try {
        const response = await api.get(`/patients/${patientId}/treatments`);
        this.treatments = response.data.treatments;
      } catch (error) {
        this.showMessage('Error al cargar tratamientos', 'error');
        console.error('Error loading treatments:');
      } finally {
        this.loadingTreatments = false;
      }
    },
    async loadTreatmentTypes() {
      this.loadingTreatmentTypes = true;
      try {
        const response = await api.get('/treatments');
        this.treatmentTypes = response.data;
      } catch (error) {
        this.showMessage('Error al cargar tipos de tratamiento', 'error');
        console.error('Error loading treatment types:');
      } finally {
        this.loadingTreatmentTypes = false;
      }
    },
    editTreatment(treatment) {
      this.editingTreatment = treatment;
      if (treatment.from_date) {
        const fromDate = new Date(treatment.from_date);
        this.fromDateOnly = fromDate.toISOString().substr(0, 10);
        this.fromTimeOnly = fromDate.toTimeString().substr(0, 5);
      }
      if (treatment.to_date) {
        const toDate = new Date(treatment.to_date);
        this.toDateOnly = toDate.toISOString().substr(0, 10);
        this.toTimeOnly = toDate.toTimeString().substr(0, 5);
      }
      this.treatmentForm = {
        treatment_type_id: treatment.treatment_type_id,
        from_date: treatment.from_date,
        to_date: treatment.to_date,
        comments: treatment.comments,
      };
      this.showAddTreatmentDialog = true;
      this.loadTreatmentTypes();
    },
    async saveTreatment() {
      if (!this.$refs.treatmentForm.validate()) return;
      this.savingTreatment = true;
      try {
        if (this.editingTreatment) {
          await api.put(`patients/${this.selectedPatient.id}/treatments/${this.editingTreatment.id}`, this.treatmentForm);
          this.showMessage('Tratamiento actualizado exitosamente', 'success');
        } else {
          await api.post(`/patients/${this.selectedPatient.id}/treatments`, this.treatmentForm);
          this.showMessage('Tratamiento agregado exitosamente', 'success');
        }
        this.closeDialog();
        await this.loadPatientTreatments(this.selectedPatient.id);
      } catch (error) {
        this.showMessage('Error al guardar tratamiento', 'error');
        console.error('Error saving treatment:');
      } finally {
        this.savingTreatment = false;
      }
    },
    deleteTreatment(treatment) {
      this.treatmentToDelete = treatment;
      this.showDeleteDialog = true;
    },
    async confirmDeleteTreatment() {
      this.deletingTreatment = true;
      try {
        await api.delete(`/patients/${this.selectedPatient.id}/treatments/${this.treatmentToDelete.id}`);
        this.showMessage('Tratamiento eliminado exitosamente', 'success');
        this.showDeleteDialog = false;
        this.loadPatientTreatments(this.selectedPatient.id);
      } catch (error) {
        this.showMessage('Error al eliminar tratamiento', 'error');
        console.error('Error deleting treatment:', error);
      } finally {
        this.deletingTreatment = false;
      }
    },
    closeDialog() {
      this.showAddTreatmentDialog = false;
      this.editingTreatment = null;
      this.treatmentForm = {
        treatment_type_id: null,
        from_date: '',
        to_date: '',
        comments: '',
      };
      this.fromDateOnly = '';
      this.fromTimeOnly = '08:00';
      this.toDateOnly = '';
      this.toTimeOnly = '09:00';
      this.fromDateTab = 0;
      this.toDateTab = 0;
      this.$refs.treatmentForm.resetValidation();
    },
    updateFromDate() {
      if (this.fromDateOnly && this.fromTimeOnly) {
        this.treatmentForm.from_date = `${this.fromDateOnly}T${this.fromTimeOnly}:00`;
      }
    },
    updateToDate() {
      if (this.toDateOnly && this.toTimeOnly) {
        this.treatmentForm.to_date = `${this.toDateOnly}T${this.toTimeOnly}:00`;
      }
    },
    formatDate(date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('es-ES');
    },
    formatDateTime(datetime) {
      if (!datetime) return '';
      const date = new Date(datetime);
      // eslint-disable-next-line
      return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    },
    showMessage(message, color = 'success') {
      this.snackbar = {
        show: true,
        message,
        color,
      };
    },
  },
};
</script>

<style scoped>
.v-card {
  margin-bottom: 20px;
}

.v-chip {
  font-size: 12px;
}
</style>

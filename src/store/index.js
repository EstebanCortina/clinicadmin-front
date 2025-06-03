import Vue from 'vue';
import Vuex from 'vuex';
import api from '@/services/api';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    token: JSON.parse(localStorage.getItem('token')) || null,
  },
  mutations: {
    setToken(state, token) {
      state.token = token;
    },
    logout(state) {
      state.token = null;
    },
  },
  actions: {
    async login({ commit }, { email, password }) {
      // Simulación de login
      try {
        const response = await api.post('/auth/sign-in', { email, password });
        localStorage.setItem('token', JSON.stringify(response.data.token));
        commit('setToken', response.data.token);
        return true;
      } catch (error) {
        return false;
      }
    },
    logout({ commit }) {
      localStorage.removeItem('token');
      commit('logout');
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.token,
  },
});

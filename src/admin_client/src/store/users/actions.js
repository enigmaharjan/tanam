import firebase from 'firebase/app';
import { SET_USER } from '@/store/types';
import router from '@/router';

const autoLogin = ({ commit }, payload) => {
  const { uid, email } = payload;
  commit(SET_USER, {
    id: uid,
    email
  });
};

const logout = async ({ commit }) => {
  await firebase.auth().signOut();
  await commit(SET_USER, null);
  router.push('/login');
};

export default {
  autoLogin,
  logout
};
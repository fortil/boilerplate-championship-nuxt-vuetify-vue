import { db } from '../plugins/firebase'
import Combinatorics from 'js-combinatorics'
export const state = () => ({
  sidebar: false,
  players: [],
  matches: [],
  user: null
})
const mapPlayers = (p) => p ? Object.keys(p).map((e) => {
  const data = {
    difPoints: p[e].points - p[e].pointsLost,
    totalPoints: p[e].playsWon * 3
  }
  return Object.assign({}, { uid: e }, p[e], data)
}) : []
const getUsrFiltered = (user) => Object.assign(
  {},
  ...['displayName', 'email', 'photoURL', 'uid', 'isAllowed'].map((e) => ({ [e]: user[e] }))
)

export const actions = {
  async setNewRecord ({ commit, state }, players) {
    if (!players) {
      return
    }
    const { player1, player2, match } = players
    const snap1 = await db().ref(`/pinpon/players/${player1.uid}`).once('value')
    const snap2 = await db().ref(`/pinpon/players/${player2.uid}`).once('value')
    const user1 = snap1.val()
    const user2 = snap2.val()
    const p1W1 = parseInt(player1.points) > parseInt(player2.points)
    const p1W2 = parseInt(player1.points) < parseInt(player2.points)
    let update = {
      [`/pinpon/players/${player1.uid}/points`]: parseInt(user1.points || 0) + parseInt(player1.points || 0),
      [`/pinpon/players/${player1.uid}/pointsLost`]: parseInt(user1.pointsLost || 0) + parseInt(player2.points || 0),
      [`/pinpon/players/${player1.uid}/plays`]: parseInt(user1.plays || 0) + 1,
      [`/pinpon/players/${player1.uid}/playsWon`]: p1W1 ? parseInt(user1.playsWon || 0) + 1 : parseInt(user1.playsWon || 0),
      [`/pinpon/players/${player1.uid}/playsLost`]: p1W2 ? parseInt(user1.playsLost || 0) + 1 : parseInt(user1.playsLost || 0),

      [`/pinpon/players/${player2.uid}/points`]: parseInt(user2.points || 0) + parseInt(player2.points || 0),
      [`/pinpon/players/${player2.uid}/pointsLost`]: parseInt(user2.pointsLost || 0) + parseInt(player1.points || 0),
      [`/pinpon/players/${player2.uid}/plays`]: parseInt(user2.plays || 0) + 1,
      [`/pinpon/players/${player2.uid}/playsWon`]: parseInt(player2.points) > parseInt(player1.points) ? parseInt(user2.playsWon || 0) + 1 : parseInt(user2.playsWon || 0),
      [`/pinpon/players/${player2.uid}/playsLost`]: parseInt(player2.points) < parseInt(player1.points) ? parseInt(user2.playsLost || 0) + 1 : parseInt(user2.playsLost || 0),

      [`/pinpon/championship/${match}/done`]: true,
      [`/pinpon/championship/${match}/date`]: db.ServerValue.TIMESTAMP,
      [`/pinpon/championship/${match}/winner`]: p1W1 ? player1.uid : player2.uid,
      [`/pinpon/championship/${match}/looser`]: p1W1 ? player2.uid : player1.uid,
      [`/pinpon/championship/${match}/points/pointsWinner`]: p1W1 ? parseInt(player1.points || 0) : parseInt(player2.points || 0),
      [`/pinpon/championship/${match}/points/pointsLosser`]: p1W1 ? parseInt(player2.points || 0) : parseInt(player1.points || 0)
    }
    return db().ref().update(update)
  },
  async saveUser ({ commit, state }, user) {
    if (!user) {
      return
    }
    const snap = await db().ref(`/users/${user.uid}`).once('value')
    const usr = getUsrFiltered(snap.val())
    commit('SET_USER', usr)
  },
  async savePlayer ({ commit, state }, name) {
    if (!name) {
      return
    }
    const users = name.split(',')
    let usersObject = {}
    let kToM = []
    for (const user in users) {
      const newKey = db().ref().child(`/pinpon/players/`).push().key
      usersObject[`/pinpon/players/${newKey}/name`] = users[user].trim()
      usersObject = Object.assign({},
        ...['points', 'playsLost', 'playsWon', 'plays', 'points', 'pointsLost'].map((e) => ({ [`/pinpon/players/${newKey}/${e}`]: 0 })),
        usersObject
      )
      kToM.push(newKey)
    }
    const snap = await db().ref(`/pinpon/championship/`).once('value')
    let mts = snap.val()
    let keys = mts ? Object.keys(mts) : []
    let mtS = mts ? [].concat.apply([], Object.keys(mts)
      .map(e => e.split('_*_')))
      .filter((i, idx, arr) => arr.indexOf(i) === idx)
      .sort() : []

    kToM = kToM.concat(mtS).sort()

    const stt = Combinatorics.combination(kToM, 2).toArray()
      .filter((i, idx, arr) => keys.indexOf(i.join('_*_')) < 0)
      .map((e) => ({ [`/pinpon/championship/${e.join('_*_')}/done`]: false }))

    let updates = Object.assign({},
      usersObject,
      ...stt
    )
    return db().ref().update(updates)
  },
  init ({ commit, state, dispatch }) {
    db().ref('/pinpon').on('value', (snap) => {
      const values = snap.val()
      if (!values) {
        return 0
      }
      if (values.players) {
        commit('SET_PLAYERS', mapPlayers(values.players))
      }
      if (values.championship && values.players) {
        const matches = Object.keys(values.championship)
          .map((key) => {
            const [keyUser1, keyUser2] = key.split('_*_')
            const title = (values.players[keyUser1].name + ' vs ' + values.players[keyUser2].name).trim()
            return Object.assign({}, values.championship[key], { title }, { key })
          })
        commit('SET_MATCHES', [...matches])
      }
    })
  }
}

export const getters = {
  user: (s) => s.user,
  players: (s) => s.players,
  matchDone: (s) => s.matches.filter((e) => e.done === true),
  matchTodo: (s) => s.matches.filter((e) => e.done === false)
}

export const mutations = {
  SET_PLAYERS (state, value) {
    state.players = value
  },
  SET_USER (state, value) {
    state.user = value
  },
  SET_MATCHES (state, value) {
    state.matches = value
  },
  toggleSidebar (state) {
    state.sidebar = !state.sidebar
  }
}

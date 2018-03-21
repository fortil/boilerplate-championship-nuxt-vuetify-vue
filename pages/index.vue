<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <div class="text-xs-center">
        <img src="/imaginamosOpenLogoTransparent.png" alt="Imaginamos Cali Open 2018" class="mb-5" style="max-width: 170px"/>
      </div>
      <v-data-table
        :headers="headers"
        :items="players"
        hide-actions
        class="elevation-1"
      >
        <template slot="items" slot-scope="props">
          <td>{{ props.item.name }}</td>
          <td class="text-xs-right">{{ props.item.plays }}</td>
          <td class="text-xs-right">{{ props.item.playsWon }}</td>
          <td class="text-xs-right">{{ props.item.playsLost }}</td>
          <td class="text-xs-right">{{ props.item.points }}</td>
          <td class="text-xs-right">{{ props.item.pointsLost }}</td>
          <td class="text-xs-right">{{ props.item.difPoints }}</td>
          <td class="text-xs-right">{{ props.item.totalPoints }}</td>
        </template>
      </v-data-table>
    </v-flex>
  </v-layout>
</template>
<script>
import {mapGetters} from 'vuex'

export default {
  computed: {
    ...mapGetters(['players'])
  },
  data () {
    return {
      headers: [
        {
          text: 'Name',
          align: 'left',
          sortable: true,
          value: 'name'
        },
        { text: 'PJ', value: 'plays' },
        { text: 'PG', value: 'playsWon' },
        { text: 'PP', value: 'playsLost' },
        { text: 'PA', value: 'points' },
        { text: 'PE', value: 'pointsLost' },
        { text: 'DP', value: 'difPoints' },
        { text: 'PT', value: 'totalPoints' }
      ]
    }
  }
}
</script>
import { createSlice } from "@reduxjs/toolkit";
import { max } from "bn.js";

const oracleCoreSlice = createSlice({
  name: "oracleCore",
  initialState: {
    seasonsNumber: 0,
    seasons: [],
    defaultSeason: 2021,
    maxSeason: 2026,
    newSeason: 0,
  },
  reducers: {
    loadSeasonsNumber(state, action) {
      state.seasonsNumber = action.payload.seasonsNumber;
    },
    loadSeasons(state, action) {
      state.seasons = action.payload.seasons;
      state.defaultSeason = state.seasons.reduce((s1, s2) => {
        return max(s1.id, s2.id);
      });
      state.maxSeason = state.defaultSeason + 5;
    },
    addSeason(state, action) {
      state.seasons.push({
        id: action.payload.id,
        state: "1",
      });
      state.defaultSeason = action.payload.id + 1;
      state.maxSeason = state.defaultSeason + 5;
    },
    closeSeason(state, action) {
      for (let season of state.seasons) {
        if (season.id === action.payload.id) {
          season.state = "2";
          break;
        }
      }
    },
    encodeNewSeason(state, action) {
      state.newSeason = action.payload.newSeason;
    },
  },
});

export const oracleCoreActions = oracleCoreSlice.actions;

export default oracleCoreSlice;

import { createSlice } from "@reduxjs/toolkit";
import { SEASON_STATE, REGIONS, SEVERITY } from "../utils/constant";

const oracleCoreSlice = createSlice({
  name: "oracleCore",
  initialState: {
    seasonsNumber: 0,
    seasons: [],
    defaultSeason: 2021,
    maxSeason: 2026,
    newSeason: 2021,
    submitOracleSeason: null,
    submitOracleRegion: REGIONS.REGA.keyName,
    submitOracleSeverity: SEVERITY.D0.keyName,
    submissions: [],
    severities: [],
  },
  reducers: {
    loadSeasonsNumber(state, action) {
      state.seasonsNumber = action.payload.seasonsNumber;
    },
    loadSeasons(state, action) {
      state.seasons = action.payload.seasons;
      const lastSeason =
        state.seasons.length > 0
          ? state.seasons.reduce((s1, s2) => {
              return s1.id > s2.id ? s1 : s2;
            })
          : null;
      state.defaultSeason = lastSeason ? lastSeason.id : state.defaultSeason;

      state.defaultSeason++;
      state.newSeason = state.defaultSeason;
      state.maxSeason = state.defaultSeason + 5;
    },
    loadSubmissions(state, action) {
      state.submissions = action.payload.submissions;
    },
    loadSeverities(state, action) {
      state.severities = action.payload.severities;
    },
    addSeason(state, action) {
      state.seasons.push({
        id: action.payload.id,
        state: SEASON_STATE[1],
      });
      state.defaultSeason++;
      state.newSeason = state.defaultSeason;
      state.maxSeason = state.defaultSeason + 5;
      state.seasonsNumber = state.seasonsNumber + 1;
    },
    addSubmission(state, action) {
      state.submissions.push({
        seasonId: action.payload.seasonId,
        region: action.payload.region,
        severity: action.payload.severity,
        submitter: action.payload.submitter,
      });
    },
    addSeverity(state, action) {
      state.severities.push({
        seasonId: action.payload.seasonId,
        region: action.payload.region,
        severity: action.payload.severity,
        submissionsCount: action.payload.submissionsCount,
      });
    },
    updateSeverity(state, action) {
      const index = state.severities.findIndex(
        (element) =>
          element.seasonId === action.payload.seasonId &&
          element.region &&
          element.action.payload.region
      );
      if (index === -1) {
        state.severities.push({
          seasonId: action.payload.seasonId,
          region: action.payload.region,
          severity: action.payload.severity,
          submissionsCount: action.payload.submissionsCount,
        });
      } else {
        state.severities[index].severity = action.payload.severity;
        state.severities[index].submissionsCount =
          action.payload.submissionsCount;
      }
    },
    closeSeason(state, action) {
      for (let season of state.seasons) {
        if (season.id === action.payload.id) {
          season.state = SEASON_STATE[2];
          break;
        }
      }
    },
    encodeNewSeason(state, action) {
      state.newSeason = action.payload.newSeason;
    },
    encodeSubmitOracleSeason(state, action) {
      state.submitOracleSeason = action.payload.submitOracleSeason;
    },
    encodeSubmitOracleRegion(state, action) {
      state.submitOracleRegion = action.payload.submitOracleRegion;
    },
    encodeSubmitOracleSeverity(state, action) {
      state.submitOracleSeverity = action.payload.submitOracleSeverity;
    },
  },
});

export const oracleCoreActions = oracleCoreSlice.actions;

export default oracleCoreSlice;

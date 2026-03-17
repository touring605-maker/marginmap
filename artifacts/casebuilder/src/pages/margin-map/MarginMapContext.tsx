import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { BaselineData, Scenario, MarginMapState } from './marginEngine';

const STORAGE_KEY = 'marginmap-state';

const initialState: MarginMapState = {
  baseline: null,
  scenarios: [],
  activeScenarioIds: [],
  setupComplete: false,
};

function loadState(): MarginMapState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as MarginMapState;
  } catch { /* ignore */ }
  return initialState;
}

function saveState(state: MarginMapState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

type Action =
  | { type: 'SET_BASELINE'; payload: BaselineData }
  | { type: 'UPDATE_BASELINE'; payload: Partial<BaselineData> }
  | { type: 'ADD_SCENARIO'; payload: { name: string; drivers?: Scenario['drivers'] } }
  | { type: 'UPDATE_SCENARIO'; payload: { id: string; name?: string; drivers?: Scenario['drivers'] } }
  | { type: 'DELETE_SCENARIO'; payload: string }
  | { type: 'SET_ACTIVE_SCENARIOS'; payload: string[] }
  | { type: 'TOGGLE_ACTIVE_SCENARIO'; payload: string }
  | { type: 'RESET_ALL' };

function createBaselineScenario(): Scenario {
  return {
    id: 'baseline',
    name: 'Baseline',
    isBaseline: true,
    drivers: {},
    createdAt: new Date().toISOString(),
  };
}

function reducer(state: MarginMapState, action: Action): MarginMapState {
  switch (action.type) {
    case 'SET_BASELINE': {
      const baselineScenario = createBaselineScenario();
      const existingCustom = state.scenarios.filter((s) => !s.isBaseline);
      return {
        ...state,
        baseline: action.payload,
        scenarios: [baselineScenario, ...existingCustom],
        setupComplete: true,
      };
    }
    case 'UPDATE_BASELINE': {
      if (!state.baseline) return state;
      return {
        ...state,
        baseline: { ...state.baseline, ...action.payload },
      };
    }
    case 'ADD_SCENARIO': {
      const id = `scenario-${Date.now()}`;
      const newScenario: Scenario = {
        id,
        name: action.payload.name,
        isBaseline: false,
        drivers: action.payload.drivers ?? {},
        createdAt: new Date().toISOString(),
      };
      const newActive = state.activeScenarioIds.length < 3
        ? [...state.activeScenarioIds, id]
        : state.activeScenarioIds;
      return {
        ...state,
        scenarios: [...state.scenarios, newScenario],
        activeScenarioIds: newActive,
      };
    }
    case 'UPDATE_SCENARIO': {
      return {
        ...state,
        scenarios: state.scenarios.map((s) =>
          s.id === action.payload.id
            ? {
                ...s,
                ...(action.payload.name !== undefined ? { name: action.payload.name } : {}),
                ...(action.payload.drivers !== undefined ? { drivers: action.payload.drivers } : {}),
              }
            : s
        ),
      };
    }
    case 'DELETE_SCENARIO': {
      return {
        ...state,
        scenarios: state.scenarios.filter((s) => s.id !== action.payload),
        activeScenarioIds: state.activeScenarioIds.filter((id) => id !== action.payload),
      };
    }
    case 'SET_ACTIVE_SCENARIOS': {
      return { ...state, activeScenarioIds: action.payload.slice(0, 3) };
    }
    case 'TOGGLE_ACTIVE_SCENARIO': {
      const id = action.payload;
      const isActive = state.activeScenarioIds.includes(id);
      const newActive = isActive
        ? state.activeScenarioIds.filter((a) => a !== id)
        : state.activeScenarioIds.length < 3
        ? [...state.activeScenarioIds, id]
        : state.activeScenarioIds;
      return { ...state, activeScenarioIds: newActive };
    }
    case 'RESET_ALL':
      return initialState;
    default:
      return state;
  }
}

interface MarginMapContextType {
  state: MarginMapState;
  dispatch: React.Dispatch<Action>;
}

const MarginMapContext = createContext<MarginMapContextType | null>(null);

export function MarginMapProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <MarginMapContext.Provider value={{ state, dispatch }}>
      {children}
    </MarginMapContext.Provider>
  );
}

export function useMarginMap() {
  const ctx = useContext(MarginMapContext);
  if (!ctx) throw new Error('useMarginMap must be used within MarginMapProvider');
  return ctx;
}

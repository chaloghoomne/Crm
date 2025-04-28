import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";



interface AuthState {
    token: string|null,
    role: string|null,
    company_id: string|null,
    id: string|null
}

interface TokenPayload {
    id: string;
    role: string;
    company_id: string;
    iat: number;
  }

const initialState: AuthState = {
    token : null,
    role : null,
    company_id : null,
    id : null
}

const authSlice = createSlice({
    name:'auth',
    initialState,
    reducers:{
        setToken:(state,action)=>{

            const decoded = jwtDecode<TokenPayload>(action.payload); 
            state.token = action.payload;
            state.role = decoded.role;
            state.company_id = decoded.company_id;
            state.id = decoded.id;
        },
        logout:(state)=>{
            state.token = null;
            state.role = null;
            state.company_id = null;
            state.id = null;
            localStorage.removeItem('Crm_token');
        }
    }
})

export const {setToken,logout} = authSlice.actions;
export default authSlice.reducer;
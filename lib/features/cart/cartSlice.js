import axios from 'axios'
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

let debounceTimer = null

export const uploadCart = createAsyncThunk('cart/uploadCart',
  async ({ getToken }, thunkAPI) => {
    try {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(async () => {
        const { cartItems } = thunkAPI.getState().cart;
        
        // Only upload if user is authenticated and cart has items
        if (!getToken) {
          return
        }
        
        try {
          const token = await getToken();
          if (!token) {
            return // User not authenticated, skip upload
          }
          
          // Ensure cartItems is a valid object (not null/undefined)
          const validCart = cartItems && typeof cartItems === 'object' ? cartItems : {};
          
          await axios.post('/api/cart', { cart: validCart }, {
            headers: { Authorization: `Bearer ${token}` }
          })
        } catch (uploadError) {
          // Silently fail if user is not authenticated or other non-critical errors
          if (uploadError?.response?.status === 401 || uploadError?.response?.status === 400) {
            console.warn('Cart upload failed:', uploadError?.response?.data?.error || uploadError.message)
            return
          }
          throw uploadError
        }
      }, 1000)
    } catch (error) {
      // Don't throw error for cart upload failures - it's not critical
      console.warn('Cart upload error:', error?.response?.data || error.message)
      return thunkAPI.rejectWithValue(error?.response?.data || { error: error.message })
    }
  }
)

export const fetchCart = createAsyncThunk('cart/fetchCart',
  async ({ getToken }, thunkAPI) => {
    try {
      const token = await getToken()
      const { data } = await axios.get('/api/cart', {headers: {
        Authorization: `Bearer ${token}` 
      }})
      return data
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data)
    }
  }
)

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        total: 0,
        cartItems: {},
    },
    reducers: {
        addToCart: (state, action) => {
            const { productId, product } = action.payload
            
            // Prevent adding sold items to cart
            if (product?.sold) {
                return state
            }
            
            if (state.cartItems[productId]) {
                state.cartItems[productId]++
            } else {
                state.cartItems[productId] = 1
            }
            state.total += 1
        },
        removeFromCart: (state, action) => {
            const { productId } = action.payload
            if (state.cartItems[productId]) {
                state.cartItems[productId]--
                if (state.cartItems[productId] === 0) {
                    delete state.cartItems[productId]
                }
            }
            state.total -= 1
        },
        deleteItemFromCart: (state, action) => {
            const { productId } = action.payload
            state.total -= state.cartItems[productId] ? state.cartItems[productId] : 0
            delete state.cartItems[productId]
        },
        clearCart: (state) => {
            state.cartItems = {}
            state.total = 0
        },
    },
    extraReducers: (builder)=>{
            builder.addCase(fetchCart.fulfilled, (state, action)=>{
              state.cartItems = action.payload.cart
              state.total = Object.values(action.payload.cart).reduce((acc, item) =>acc + item, 0)
            })
          }
        })    
          
export const { addToCart, removeFromCart, clearCart, deleteItemFromCart } = cartSlice.actions
          
export default cartSlice.reducer
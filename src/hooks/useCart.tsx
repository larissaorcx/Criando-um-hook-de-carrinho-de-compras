import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Product } from '../types';
import {consultaStock} from '../services/stock'
import {consultaProdutos} from '../services/products'

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart')

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const stockProduct = await consultaStock(productId)
      
      const newCart = [...cart]

      const sameProduct = newCart.find(indice => indice.id === productId)

      if(sameProduct){
        if (sameProduct.amount >= stockProduct){
          toast.error('Quantidade solicitada fora de estoque');
          return
        }
        else{
          sameProduct.amount += 1
        }
      }else{
        const initialProduct = await consultaProdutos(productId);

        const newProduct = {
          ...initialProduct,
          amount: 1
        }
        newCart.push(newProduct) 
      }
      setCart(newCart)

    } catch {
      toast.error('Erro na adição do produto');
    }
  }

  const removeProduct = (productId: number) => {
    
    setCart(cart.filter(product => product.id !== productId))
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      
      if(amount <= 0){
        return
      }
      const updateAmount = [...cart]

      const productAmount = await consultaStock(productId)

      const sameProduct = updateAmount.find(indice => indice.id === productId)

      if(sameProduct){
        if (amount <= productAmount){
          sameProduct.amount = amount
        }else{
          toast.error('Quantidade solicitada fora de estoque');
          return
        }
      }

      setCart(updateAmount)
     
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  useEffect(() => localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
  ,[cart])

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}

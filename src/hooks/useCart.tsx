import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

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

      const stockProduct = await api.get(`/stock/${productId}`)
      .then(response => response.data.amount)
      
      const newCart = [...cart]

      const sameIndex = newCart.findIndex(indice => indice.id === productId)
      

      if(sameIndex !== -1){
        if (newCart[sameIndex].amount >= stockProduct){
          toast.error('Quantidade solicitada fora de estoque');
        }
        else{
          newCart[sameIndex].amount  += 1
        }
      }else{
        const initialProduct = await api.get(`/products/${productId}`);

        const newProduct = {
          ...initialProduct.data,
          amount: 1
        }
        newCart.push(newProduct) 
      }
      setCart(newCart)
      
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCart));

    } catch {
      toast.error('Erro na adição do produto');
    }
  }

  const removeProduct = (productId: number) => {
    try {
      const removeCart = [...cart]

      const trash = removeCart.findIndex(indice => indice.id === productId);

      if(trash !== -1){
        removeCart.splice(trash,1)

        console.log('removido', trash)
      }
    
      setCart(removeCart)

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(removeCart));
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      console.log("entrou")

      const updateAmount = [...cart]

      const productAmount = await api.get(`/stock/${productId}`)
      .then(response => response.data.amount)

      const productIndex = updateAmount.findIndex(indice => indice.id === productId)

      if(productIndex !== -1){
        if(updateAmount[productIndex].amount <= 0){
          return
        }
        if(amount === 1){
          if ((updateAmount[productIndex].amount) < productAmount){
            updateAmount[productIndex].amount += amount
          }else{
            toast.error('Quantidade solicitada fora de estoque');
          }
        }
        if(amount === -1){
          if ((updateAmount[productIndex].amount) <= productAmount){
            updateAmount[productIndex].amount += amount
          }else{
            toast.error('Quantidade solicitada fora de estoque');
          }
        }
      }

      setCart(updateAmount)

      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updateAmount));
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

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

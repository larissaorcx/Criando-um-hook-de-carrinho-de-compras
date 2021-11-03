import { api } from "./api"
import { Product } from '../types';

export async function consultaProdutos (productId: number){
    const produtos = await api.get<Product>(`/products/${productId}`)
    .then(response => response.data)

    return produtos
  }
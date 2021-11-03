import { Stock } from "../types"
import { api } from "./api"

export async function consultaStock (productId: number){
    const stock = await api.get<Stock>(`/stock/${productId}`)
    .then(response => response.data.amount)

    return stock
  }
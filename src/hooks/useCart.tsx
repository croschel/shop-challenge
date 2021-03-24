import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

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
    const storagedCart = localStorage.getItem("@RocketShoes:cart");
    console.log("storage :: ", storagedCart);

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("@RocketShoes:cart", JSON.stringify(cart));
  }, [cart]);

  console.log("carrinho :: ", cart);
  const addProduct = async (productId: number) => {
    try {
      let hasStock: boolean;
      const existItemIndex = cart.findIndex((item) => item.id === productId);

      const stock = await api.get(`/stock/${productId}`);
      const { amount } = stock.data;
      if (amount > 0) {
        hasStock = true;
      } else {
        hasStock = false;
      }
      if (existItemIndex >= 0) {
        if (hasStock) {
          console.log("Hey I am here");
          const newArray = cart.map((item) => {
            if (item.id === productId) {
              item.amount += 1;
            }
            return item;
          });
          setCart(newArray);
        } else {
          toast.error("Quantidade solicitada fora de estoque");
        }
      } else {
        if (hasStock) {
          const itemComplete = await api.get(`/products/${productId}`);
          const data = { ...itemComplete.data, amount: 1 };
          setCart([...cart, data]);
        } else {
          toast.error("Quantidade solicitada fora de estoque");
        }
      }
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const newArray = cart.filter((item) => item.id !== productId);
      setCart(newArray);
    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
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

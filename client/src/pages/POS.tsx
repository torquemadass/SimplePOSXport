import { useState } from "react";
import { Plus, Trash2, Coffee, Download, CreditCard, PackagePlus, History, ShoppingCart } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Import generated assets
import espressoImg from "@assets/generated_images/espresso_cup_on_saucer.png";
import croissantImg from "@assets/generated_images/fresh_croissant.png";
import matchaImg from "@assets/generated_images/iced_matcha_latte.png";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface Sale {
  id: string;
  date: string;
  total: number;
  items: string;
  paymentMethod: string;
}

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Espresso Single",
    price: 3.50,
    image: espressoImg,
    category: "Coffee",
  },
  {
    id: 2,
    name: "Butter Croissant",
    price: 4.25,
    image: croissantImg,
    category: "Pastry",
  },
  {
    id: 3,
    name: "Iced Matcha Latte",
    price: 5.75,
    image: matchaImg,
    category: "Tea",
  },
];

export default function POS() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [salesHistory, setSalesHistory] = useState<Sale[]>([]);
  const [activeTab, setActiveTab] = useState<"pos" | "history">("pos");
  const { toast } = useToast();

  // New Product Form State
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const newSale: Sale = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      date: new Date().toLocaleString(),
      total: cartTotal,
      items: cart.map(i => `${i.quantity}x ${i.name}`).join(", "),
      paymentMethod: "Card", // Mock payment method
    };

    setSalesHistory((prev) => [newSale, ...prev]);
    setCart([]);
    toast({
      title: "Order Completed",
      description: `Transaction #${newSale.id} successful.`,
    });
  };

  const handleAddProduct = () => {
    if (!newProductName || !newProductPrice) return;

    const newProduct: Product = {
      id: Date.now(),
      name: newProductName,
      price: parseFloat(newProductPrice),
      image: "https://images.unsplash.com/photo-1554520735-0a6b8b6ce8b7?auto=format&fit=crop&w=500&q=60", // Generic placeholder
      category: "Custom",
    };

    setProducts([...products, newProduct]);
    setNewProductName("");
    setNewProductPrice("");
    setIsAddProductOpen(false);
    toast({
      title: "Product Added",
      description: `${newProduct.name} is now available.`,
    });
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(salesHistory);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");
    XLSX.writeFile(workbook, "sales_report.xlsx");
    toast({
      title: "Export Successful",
      description: "Sales report downloaded.",
    });
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col md:flex-row">
      {/* LEFT SIDE: Main Content (Products or History) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <Coffee className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-heading font-bold tracking-tight">SwiftPOS</h1>
          </div>

          <div className="flex gap-2 bg-secondary/50 p-1 rounded-lg">
            <Button
              variant={activeTab === "pos" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("pos")}
              className={activeTab === "pos" ? "shadow-sm bg-white" : ""}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Register
            </Button>
            <Button
              variant={activeTab === "history" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("history")}
              className={activeTab === "history" ? "shadow-sm bg-white" : ""}
            >
              <History className="mr-2 h-4 w-4" />
              Sales
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-secondary/20">
          {activeTab === "pos" ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-heading font-semibold">Menu</h2>
                <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Plus className="h-4 w-4" /> Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Product Name</label>
                        <Input
                          value={newProductName}
                          onChange={(e) => setNewProductName(e.target.value)}
                          placeholder="e.g. Vanilla Muffin"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Price ($)</label>
                        <Input
                          type="number"
                          value={newProductPrice}
                          onChange={(e) => setNewProductPrice(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddProduct}>Save Product</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className="overflow-hidden cursor-pointer hover:shadow-md transition-all group border-0 shadow-sm"
                    onClick={() => addToCart(product)}
                    data-testid={`card-product-${product.id}`}
                  >
                    <div className="aspect-square relative overflow-hidden bg-gray-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium truncate text-lg">{product.name}</h3>
                      <p className="text-muted-foreground">${product.price.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-heading font-semibold">Sales History</h2>
                <Button onClick={exportToExcel} variant="outline" className="gap-2">
                  <Download className="h-4 w-4" /> Export to Excel
                </Button>
              </div>

              <div className="bg-card rounded-xl border shadow-sm flex-1 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          No sales yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      salesHistory.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-mono text-xs">{sale.id}</TableCell>
                          <TableCell>{sale.date}</TableCell>
                          <TableCell className="max-w-[200px] truncate" title={sale.items}>{sale.items}</TableCell>
                          <TableCell className="font-bold">${sale.total.toFixed(2)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* RIGHT SIDE: Cart Sidebar */}
      <aside className="w-full md:w-[400px] bg-card border-l flex flex-col h-[40vh] md:h-screen shadow-xl z-20">
        <div className="p-6 border-b flex items-center justify-between bg-white/50 backdrop-blur-sm">
          <h2 className="text-xl font-heading font-bold">Current Order</h2>
          <Badge variant="secondary" className="font-mono text-sm">
            {cart.length} Items
          </Badge>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
              <ShoppingCart className="h-12 w-12 opacity-20" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-4 group">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-14 w-14 rounded-md object-cover bg-gray-100"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    ${item.price.toFixed(2)}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 bg-secondary rounded-md p-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }}
                    className="h-6 w-6 flex items-center justify-center hover:bg-background rounded text-sm"
                  >
                    -
                  </button>
                  <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }}
                    className="h-6 w-6 flex items-center justify-center hover:bg-background rounded text-sm"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-secondary/30 border-t space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Tax (8%)</span>
              <span>${(cartTotal * 0.08).toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-xl font-bold text-foreground">
              <span>Total</span>
              <span>${(cartTotal * 1.08).toFixed(2)}</span>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full font-bold text-lg h-14 shadow-primary/20 shadow-lg"
            disabled={cart.length === 0}
            onClick={handleCheckout}
          >
            Charge ${(cartTotal * 1.08).toFixed(2)}
          </Button>
        </div>
      </aside>
    </div>
  );
}

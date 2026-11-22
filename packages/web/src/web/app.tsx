import { Route, Switch } from "wouter";
import Index from "./pages/index";
import ProductsPage from "./pages/products";
import CartPage from "./pages/cart";
import CheckoutPage from "./pages/checkout";
import OrdersPage from "./pages/orders";
import TrackPage from "./pages/track";
import AdminPage from "./pages/admin";
import RiderPage from "./pages/rider";
import { Provider } from "./components/provider";
import { AgentFeedback } from "@runablehq/website-runtime";

function App() {
  return (
    <Provider>
      <Switch>
        <Route path="/" component={Index} />
        <Route path="/products" component={ProductsPage} />
        <Route path="/products/:id" component={ProductsPage} />
        <Route path="/cart" component={CartPage} />
        <Route path="/checkout" component={CheckoutPage} />
        <Route path="/orders" component={OrdersPage} />
        <Route path="/track/:id" component={TrackPage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/rider" component={RiderPage} />
      </Switch>
      {import.meta.env.DEV && <AgentFeedback />}
    </Provider>
  );
}

export default App;

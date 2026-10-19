import ProductLineHubPage, {
  productLineHubMetadata
} from "@/components/shop/ProductLineHubPage";
import { getProductLineHub } from "@/lib/shop/product-lines";

const config = getProductLineHub("home");

export const metadata = productLineHubMetadata(config);

export default function HomeLinePage() {
  return <ProductLineHubPage config={config} />;
}

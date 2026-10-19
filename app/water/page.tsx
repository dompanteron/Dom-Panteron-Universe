import ProductLineHubPage, {
  productLineHubMetadata
} from "@/components/shop/ProductLineHubPage";
import { getProductLineHub } from "@/lib/shop/product-lines";

const config = getProductLineHub("water");

export const metadata = productLineHubMetadata(config);

export default function WaterLinePage() {
  return <ProductLineHubPage config={config} />;
}

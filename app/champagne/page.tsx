import ProductLineHubPage, {
  productLineHubMetadata
} from "@/components/shop/ProductLineHubPage";
import { getProductLineHub } from "@/lib/shop/product-lines";

const config = getProductLineHub("champagne");

export const metadata = productLineHubMetadata(config);

export default function ChampagneLinePage() {
  return <ProductLineHubPage config={config} />;
}

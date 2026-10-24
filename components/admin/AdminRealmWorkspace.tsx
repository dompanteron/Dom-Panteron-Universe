"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import AdminRaffleForm, { type RaffleFormValues } from "@/components/AdminRaffleForm";
import AdminCollectionForm, { type CollectionFormValues } from "@/components/admin/AdminCollectionForm";
import AdminModal from "@/components/admin/AdminModal";
import AdminProductForm, {
  type CollectionOption,
  type ProductFormValues
} from "@/components/admin/AdminProductForm";
import { realmShopPath } from "@/lib/shop/realm-ui";
import type { RealmRow } from "@/lib/shop/types";

export type RealmWorkspaceCollection = CollectionFormValues & {
  id: string;
};

export type RealmWorkspaceProduct = ProductFormValues & {
  collection_name: string;
};

export type RealmWorkspaceRaffle = RaffleFormValues & {
  id: string;
};

type ModalState =
  | null
  | { kind: "collection"; mode: "create" }
  | { kind: "collection"; mode: "edit"; id: string }
  | { kind: "product"; mode: "create" }
  | { kind: "product"; mode: "edit"; id: string }
  | { kind: "raffle"; mode: "create" }
  | { kind: "raffle"; mode: "edit"; id: string };

function formatDrawShort(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(iso));
}

export default function AdminRealmWorkspace({
  realm,
  collections,
  products,
  raffles
}: {
  realm: RealmRow;
  collections: RealmWorkspaceCollection[];
  products: RealmWorkspaceProduct[];
  raffles: RealmWorkspaceRaffle[];
}) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalState>(null);

  const realmOption = { id: realm.id, slug: realm.slug, name: realm.name };
  const collectionOptions: CollectionOption[] = collections.map((collection) => ({
    id: collection.id!,
    name: collection.name,
    product_line: realm.slug
  }));

  const activeModal = useMemo(() => {
    if (!modal) {
      return null;
    }
    if (modal.kind === "collection" && modal.mode === "edit") {
      return {
        ...modal,
        collection: collections.find((collection) => collection.id === modal.id)
      };
    }
    if (modal.kind === "product" && modal.mode === "edit") {
      return { ...modal, product: products.find((product) => product.id === modal.id) };
    }
    if (modal.kind === "raffle" && modal.mode === "edit") {
      return { ...modal, raffle: raffles.find((raffle) => raffle.id === modal.id) };
    }
    return modal;
  }, [modal, collections, products, raffles]);

  function afterSave() {
    setModal(null);
    router.refresh();
  }

  function modalTitle() {
    if (!activeModal) {
      return "";
    }
    const prefix =
      activeModal.mode === "create" ? "New" : "Quick edit";
    if (activeModal.kind === "collection") {
      return `${prefix} collection · ${realm.name}`;
    }
    if (activeModal.kind === "product") {
      return `${prefix} product · ${realm.name}`;
    }
    return `${prefix} raffle · ${realm.name}`;
  }

  return (
    <>
      <div className="border border-white/10 p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-panteron-violet">In this realm</p>
        <p className="mt-2 text-sm text-zinc-400">
          Quick add and quick edit stay on this page. Use <span className="text-zinc-300">Full</span>{" "}
          for advanced fields (draw runner, full gallery).
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setModal({ kind: "collection", mode: "create" })}
            className="bg-panteron-purple px-4 py-2 text-sm font-medium text-white hover:bg-panteron-violet"
          >
            + Collection
          </button>
          <button
            type="button"
            onClick={() => setModal({ kind: "product", mode: "create" })}
            disabled={collections.length === 0}
            className="border border-white/20 px-4 py-2 text-sm text-zinc-200 hover:border-panteron-violet disabled:cursor-not-allowed disabled:opacity-40"
          >
            + Product
          </button>
          <button
            type="button"
            onClick={() => setModal({ kind: "raffle", mode: "create" })}
            className="border border-white/20 px-4 py-2 text-sm text-zinc-200 hover:border-panteron-violet"
          >
            + Raffle
          </button>
          {realm.status === "active" ? (
            <Link
              href={`${realmShopPath(realm.slug)}#draws`}
              className="border border-white/10 px-4 py-2 text-sm text-zinc-400 hover:text-white"
            >
              Hub draws →
            </Link>
          ) : null}
        </div>

        <div className="mt-8 space-y-8">
          <section>
            <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Collections ({collections.length})
            </h3>
            {collections.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">No collections yet — add one above.</p>
            ) : (
              <ul className="mt-3 divide-y divide-white/10 border-y border-white/10">
                {collections.map((collection) => (
                  <li
                    key={collection.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div>
                      <p className="text-white">{collection.name}</p>
                      <p className="text-xs text-zinc-500">
                        {collection.status} · /collections/{collection.slug}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-3 text-sm">
                      <button
                        type="button"
                        onClick={() =>
                          setModal({ kind: "collection", mode: "edit", id: collection.id })
                        }
                        className="text-panteron-violet hover:text-white"
                      >
                        Quick edit
                      </button>
                      <Link
                        href={`/admin/collections/${collection.id}`}
                        className="text-zinc-500 hover:text-zinc-300"
                      >
                        Full
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Products ({products.length})
            </h3>
            {products.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">
                {collections.length === 0
                  ? "Add a collection first."
                  : "No products in this realm yet."}
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-white/10 border-y border-white/10">
                {products.map((product) => (
                  <li
                    key={product.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div>
                      <p className="text-white">{product.title}</p>
                      <p className="text-xs text-zinc-500">
                        {product.status} · {product.collection_name}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-3 text-sm">
                      <button
                        type="button"
                        onClick={() =>
                          setModal({ kind: "product", mode: "edit", id: product.id! })
                        }
                        className="text-panteron-violet hover:text-white"
                      >
                        Quick edit
                      </button>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-zinc-500 hover:text-zinc-300"
                      >
                        Full
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Raffles ({raffles.length})
            </h3>
            {raffles.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">
                No draws tagged to this realm yet — add one above.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-white/10 border-y border-white/10">
                {raffles.map((raffle) => (
                  <li
                    key={raffle.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div>
                      <p className="text-white">{raffle.title}</p>
                      <p className="text-xs text-zinc-500">
                        {raffle.status} · draw {formatDrawShort(raffle.draw_date)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-3 text-sm">
                      <button
                        type="button"
                        onClick={() =>
                          setModal({ kind: "raffle", mode: "edit", id: raffle.id })
                        }
                        className="text-panteron-violet hover:text-white"
                      >
                        Quick edit
                      </button>
                      <Link
                        href={`/admin/raffles/${raffle.id}`}
                        className="text-zinc-500 hover:text-zinc-300"
                      >
                        Full
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <AdminModal open={modal !== null} title={modalTitle()} onClose={() => setModal(null)}>
        {activeModal?.kind === "collection" && activeModal.mode === "create" ? (
          <AdminCollectionForm
            key="collection-create"
            realms={[realmOption]}
            lockedRealmId={realm.id}
            onSaved={afterSave}
          />
        ) : null}
        {activeModal?.kind === "collection" &&
        activeModal.mode === "edit" &&
        "collection" in activeModal &&
        activeModal.collection ? (
          <AdminCollectionForm
            key={`collection-edit-${activeModal.id}`}
            collection={activeModal.collection}
            realms={[realmOption]}
            lockedRealmId={realm.id}
            onSaved={afterSave}
          />
        ) : null}
        {activeModal?.kind === "product" && activeModal.mode === "create" ? (
          <AdminProductForm
            key="product-create"
            collections={collectionOptions}
            onSaved={afterSave}
          />
        ) : null}
        {activeModal?.kind === "product" &&
        activeModal.mode === "edit" &&
        "product" in activeModal &&
        activeModal.product ? (
          <AdminProductForm
            key={`product-edit-${activeModal.id}`}
            product={activeModal.product}
            collections={collectionOptions}
            onSaved={afterSave}
          />
        ) : null}
        {activeModal?.kind === "raffle" && activeModal.mode === "create" ? (
          <AdminRaffleForm
            key="raffle-create"
            realms={[realmOption]}
            lockedRealmSlug={realm.slug}
            onSaved={afterSave}
          />
        ) : null}
        {activeModal?.kind === "raffle" &&
        activeModal.mode === "edit" &&
        "raffle" in activeModal &&
        activeModal.raffle ? (
          <AdminRaffleForm
            key={`raffle-edit-${activeModal.id}`}
            raffle={activeModal.raffle}
            realms={[realmOption]}
            lockedRealmSlug={realm.slug}
            onSaved={afterSave}
          />
        ) : null}
      </AdminModal>
    </>
  );
}

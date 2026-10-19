import CollectionCountdown from "@/components/shop/CollectionCountdown";
import type { CollectionRevealState } from "@/lib/shop/collection-reveal";

export default function CollectionRevealBanner({
  reveal,
  collectionName
}: {
  reveal: CollectionRevealState;
  collectionName: string;
}) {
  if (reveal.isLive || !reveal.revealAt) {
    return null;
  }

  return (
    <div className="border border-panteron-violet/40 bg-panteron-deep px-6 py-8 text-center md:px-10">
      <p className="text-xs uppercase tracking-[0.3em] text-panteron-violet">Drop countdown</p>
      <h2 className="font-display mt-3 text-2xl text-white sm:text-3xl">{collectionName}</h2>
      <p className="mx-auto mt-3 max-w-lg text-sm text-zinc-400">
        {reveal.showProducts
          ? "Preview the pieces below — checkout opens when the timer hits zero."
          : "Pieces unlock when the timer hits zero."}
      </p>
      <div className="mt-8 flex justify-center">
        <CollectionCountdown revealAt={reveal.revealAt} />
      </div>
    </div>
  );
}

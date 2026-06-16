import Image from "next/image";

export default function Loading() {
  return (
    <div className="grid min-h-screen place-items-center bg-white">
      <div className="text-center">
        <div className="relative mx-auto h-36 w-36">
          <Image src="/tecnova-loader.png" alt="Tecnova Perú" fill sizes="144px" className="object-contain" />
        </div>
        <div className="mx-auto mt-6 h-[3px] w-44 overflow-hidden rounded-full bg-neutral-200">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-tecnova-red" />
        </div>
      </div>
    </div>
  );
}

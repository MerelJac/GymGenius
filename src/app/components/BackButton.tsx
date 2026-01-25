import Link from "next/link";

type BackButtonProps = {
  route: string;
};

export function BackButton({ route }: BackButtonProps) {
  return (
    <Link href={route} className="underline">
      Back
    </Link>
  );
}

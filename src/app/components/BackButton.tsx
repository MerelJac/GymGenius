import Link from "next/link";
import { ArrowLeft } from "lucide-react";
type BackButtonProps = {
  route: string;
};

export function BackButton({ route }: BackButtonProps) {
  return (
    <Link href={route} className=" flex items-center gap-2 uppercase text-xs bolderfont-medium">
      < ArrowLeft size={16}/>Back
    </Link>
  );
}

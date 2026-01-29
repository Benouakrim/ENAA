import { redirect } from "next/navigation";

// This page redirects to the main services page with category filter
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  redirect(`/services?category=${category}`);
}

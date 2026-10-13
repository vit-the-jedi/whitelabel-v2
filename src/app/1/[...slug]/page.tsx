import { notFound } from "next/navigation";

import { getRequestConfig } from "@/app/configs/getRequestConfig";
import { resolveFlowPage } from "@/app/mappings/FlowMapping";

type Props = {
  params: Promise<{ slug?: string[] }>;
};

export default async function CatchAllPage({ params }: Props) {
  const [{ slug = [] }, requestConfig] = await Promise.all([params, getRequestConfig()]);

  const FlowPage = resolveFlowPage(requestConfig.vertical, slug);

  if (!FlowPage) {
    notFound();
  }

  return <FlowPage config={requestConfig} slug={slug} />;
}

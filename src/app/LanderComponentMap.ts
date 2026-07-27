import dynamic from "next/dynamic";

export const landerComponentMap: Record<string, any> = {
  "searchmynewjob.com": dynamic(() => import("@/components/Landers/searchmynewjob.com")),
  //protect: dynamic(() => import('@/components/Landers/Protect')),
};

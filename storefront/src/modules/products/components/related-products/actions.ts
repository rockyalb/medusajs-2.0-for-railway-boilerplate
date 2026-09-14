"use server"

import {
  getRelatedProductsPage,
  type RelatedProductsPage,
  type RelatedProductsPageRequest,
} from "./data"

/** Server action used by the near-viewport loader and the demand pagination button. */
export async function loadRelatedProductsPage(
  request: RelatedProductsPageRequest
): Promise<RelatedProductsPage> {
  return getRelatedProductsPage(request)
}

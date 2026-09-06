import { handleAssetRequest } from "@tailorkit/api-platform/assets";
import { getStorage } from "@tailorkit/storage";
import { fromWebHandler } from "nitro/h3";

export default fromWebHandler((request) => handleAssetRequest(request, getStorage()));

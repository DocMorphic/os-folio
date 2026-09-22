import {redirect} from "next/navigation";

// Keep old preview links useful after the experiment was retired.
export default function RetiredWaterPreview(){redirect("/v2");}

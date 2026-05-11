export const appConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "",
  lodopDownloadUrl:
    process.env.NEXT_PUBLIC_LODOP_DOWNLOAD_URL ||
    "https://label-1254307677.cos.ap-chengdu.myqcloud.com/zip_files/CLodop_Setup_for_Win32NT.exe.zip",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://label.zwglass.net",
};

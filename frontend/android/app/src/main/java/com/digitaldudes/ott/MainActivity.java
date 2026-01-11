package com.digitaldudes.ott;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        handleDeepLink(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleDeepLink(intent);
    }

    private void handleDeepLink(Intent intent) {
        if (intent == null) return;
        Uri data = intent.getData();
        if (data == null) return;

        String scheme = data.getScheme();
        String host = data.getHost();
        String path = data.getPath();

        if (!"digitaldudes".equals(scheme)) return;
        if (!"auth".equals(host)) return;
        if (path == null || !path.startsWith("/callback")) return;

        String encodedQuery = data.getEncodedQuery();
        String target = "capacitor://localhost/auth/callback";
        if (encodedQuery != null && !encodedQuery.isEmpty()) {
            target = target + "?" + encodedQuery;
        }

        if (this.bridge != null && this.bridge.getWebView() != null) {
            this.bridge.getWebView().loadUrl(target);
        }
    }
}

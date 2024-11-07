package com.knowbia.app;
import android.os.Bundle;
import android.view.View;
import com.getcapacitor.BridgeActivity;
import android.view.WindowManager;
public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Enable full-screen mode
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_FULLSCREEN |
            View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );

        // Set FLAG_SECURE to prevent screenshots
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE,
            WindowManager.LayoutParams.FLAG_SECURE);
    }

    @Override
    public void onBackPressed() {
        // Do nothing
    }

}

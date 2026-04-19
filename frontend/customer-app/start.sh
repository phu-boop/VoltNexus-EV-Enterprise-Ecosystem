# Replace PORT placeholder in nginx config with actual PORT from environment
sed -i "s/listen 80;/listen ${PORT:-80};/g" /etc/nginx/conf.d/default.conf

# Runtime Environment Variable Injection for Vite
# Replaces placeholders in .js files with actual environment variables
echo "Injecting runtime environment variables..."
for file in /usr/share/nginx/html/assets/*.js; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    sed -i "s|VITE_API_BASE_URL_PLACEHOLDER|${VITE_API_BASE_URL}|g" "$file"
    sed -i "s|VITE_RECAPTCHA_SITE_KEY_PLACEHOLDER|${VITE_RECAPTCHA_SITE_KEY}|g" "$file"
  fi
done

# Start nginx
exec nginx -g "daemon off;"

import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Cookie, Settings, BarChart, Target } from 'lucide-react';
import Footer from '@/components/Footer';

export default function CookiePolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Cookie className="h-8 w-8 text-primary" />
              Cookie Policy
            </h1>
            <p className="text-gray-600">Last updated: October 5, 2025</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle>What Are Cookies?</CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">
                Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better browsing experience by remembering your preferences, analyzing how you use our site, and personalizing content and advertisements.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                This Cookie Policy explains what cookies are, how we use them, the types of cookies we use, and how you can control your cookie preferences.
              </p>
            </CardContent>
          </Card>

          {/* Types of Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Types of Cookies We Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Essential Cookies */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Settings className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Essential Cookies</h3>
                  <Badge variant="secondary">Always Active</Badge>
                </div>
                <p className="text-gray-700 mb-3">
                  These cookies are necessary for the website to function properly and cannot be disabled. They enable basic functions like page navigation, access to secure areas, and shopping cart functionality.
                </p>
                <div className="text-sm text-gray-600">
                  <strong>Examples:</strong> Session management, security tokens, load balancing
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Analytics Cookies</h3>
                  <Badge variant="outline">Optional</Badge>
                </div>
                <p className="text-gray-700 mb-3">
                  These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website's performance and user experience.
                </p>
                <div className="text-sm text-gray-600">
                  <strong>Examples:</strong> Google Analytics, page views, bounce rate, traffic sources
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Marketing Cookies</h3>
                  <Badge variant="outline">Optional</Badge>
                </div>
                <p className="text-gray-700 mb-3">
                  These cookies are used to deliver personalized advertisements and track the effectiveness of our marketing campaigns. They may be set by us or third-party advertising partners.
                </p>
                <div className="text-sm text-gray-600">
                  <strong>Examples:</strong> Facebook Pixel, Google Ads, retargeting pixels
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Cookie className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Functional Cookies</h3>
                  <Badge variant="outline">Optional</Badge>
                </div>
                <p className="text-gray-700 mb-3">
                  These cookies enable enhanced functionality and personalization, such as remembering your preferences, language settings, and providing live chat support.
                </p>
                <div className="text-sm text-gray-600">
                  <strong>Examples:</strong> Language preferences, theme settings, chat widgets
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Third-Party Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>Third-Party Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We may use third-party services that set their own cookies on our website. These services include:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Google Analytics</h4>
                  <p className="text-sm text-gray-600 mb-2">Web analytics service</p>
                  <p className="text-xs text-gray-500">
                    Privacy Policy: <a href="https://policies.google.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Facebook Pixel</h4>
                  <p className="text-sm text-gray-600 mb-2">Advertising and analytics</p>
                  <p className="text-xs text-gray-500">
                    Privacy Policy: <a href="https://www.facebook.com/privacy/policy/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Facebook Privacy Policy</a>
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Stripe</h4>
                  <p className="text-sm text-gray-600 mb-2">Payment processing</p>
                  <p className="text-xs text-gray-500">
                    Privacy Policy: <a href="https://stripe.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Stripe Privacy Policy</a>
                  </p>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Intercom</h4>
                  <p className="text-sm text-gray-600 mb-2">Customer support chat</p>
                  <p className="text-xs text-gray-500">
                    Privacy Policy: <a href="https://www.intercom.com/legal/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Intercom Privacy Policy</a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cookie Duration */}
          <Card>
            <CardHeader>
              <CardTitle>Cookie Duration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Session Cookies</h3>
                <p className="text-gray-700">
                  These cookies are temporary and are deleted when you close your browser. They are used to maintain your session while browsing our website.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Persistent Cookies</h3>
                <p className="text-gray-700">
                  These cookies remain on your device for a specified period or until you delete them. They help us remember your preferences for future visits.
                </p>
                <div className="mt-3 text-sm text-gray-600">
                  <p><strong>Typical duration:</strong> 30 days to 2 years, depending on the cookie type</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Managing Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>How to Manage Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Cookie Consent Banner</h3>
                <p className="text-gray-700">
                  When you first visit our website, you'll see a cookie consent banner where you can choose which types of cookies to accept. You can change your preferences at any time by clicking the "Cookie Settings" link in our footer.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Browser Settings</h3>
                <p className="text-gray-700 mb-3">
                  You can also manage cookies through your browser settings. Here's how to access cookie settings in popular browsers:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                  <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
                  <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                  <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> Disabling certain cookies may affect the functionality of our website and your user experience.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Updates to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by updating the "Last updated" date at the top of this policy.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                If you have any questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> privacy@example.com</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                <p><strong>Address:</strong> 123 Cookie Street, Web City, WC 12345</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
import Layout from '../../components/layout/Layout';
import ProtectedRoute from '../../components/ProtectedRoute';
import withAuth from '../../components/withAuth';
import { Card, Button } from '../../components/ui';
import { PERMISSIONS } from '../../lib/roles';

function Settings() {
  return (
    <Layout>
      <ProtectedRoute permission={PERMISSIONS.MANAGE_SETTINGS}>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage system settings and configurations</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Manage Roles & Permissions
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  User Registration Settings
                </Button>
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Configuration</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Email Templates
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Notification Settings
                </Button>
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Settings</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Measurement Workflow
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Installation Process
                </Button>
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Backup & Restore
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Export Data
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    </Layout>
  );
}

export default withAuth(Settings);
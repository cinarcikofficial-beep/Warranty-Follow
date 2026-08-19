const session = require('express-session');

class SupabaseSessionStore extends session.Store {
    constructor(supabase, options = {}) {
        super(options);
        this.supabase = supabase;
        this.tableName = options.tableName || 'sessions';
        this.ttl = options.ttl || 86400;
    }

    async get(sid, callback) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('sess, expired_at')
                .eq('sid', sid)
                .single();

            if (error || !data) return callback(null, null);

            if (new Date(data.expired_at) < new Date()) {
                await this.destroy(sid);
                return callback(null, null);
            }

            callback(null, JSON.parse(data.sess));
        } catch (err) {
            callback(err);
        }
    }

    async set(sid, sess, callback) {
        try {
            const maxAge = sess.cookie && sess.cookie.maxAge;
            const expiredAt = maxAge
                ? new Date(Date.now() + maxAge)
                : new Date(Date.now() + this.ttl * 1000);

            const { error } = await this.supabase
                .from(this.tableName)
                .upsert({
                    sid: sid,
                    sess: JSON.stringify(sess),
                    expired_at: expiredAt.toISOString()
                }, { onConflict: 'sid' });

            callback(error);
        } catch (err) {
            callback(err);
        }
    }

    async destroy(sid, callback) {
        try {
            const { error } = await this.supabase
                .from(this.tableName)
                .delete()
                .eq('sid', sid);

            callback(error);
        } catch (err) {
            callback(err);
        }
    }
}

module.exports = SupabaseSessionStore;
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

            if (error) {
                console.error('[SessionStore] GET hatası:', error.message);
                return callback(null, null);
            }

            if (!data) return callback(null, null);

            if (new Date(data.expired_at) < new Date()) {
                await this.destroy(sid);
                return callback(null, null);
            }

            callback(null, JSON.parse(data.sess));
        } catch (err) {
            console.error('[SessionStore] GET exception:', err.message);
            callback(null, null);
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

            if (error) {
                console.error('[SessionStore] SET hatası:', error.message);
            }

            callback(null);
        } catch (err) {
            console.error('[SessionStore] SET exception:', err.message);
            callback(null);
        }
    }

    async destroy(sid, callback) {
        try {
            const { error } = await this.supabase
                .from(this.tableName)
                .delete()
                .eq('sid', sid);

            if (error) {
                console.error('[SessionStore] DESTROY hatası:', error.message);
            }

            callback(null);
        } catch (err) {
            console.error('[SessionStore] DESTROY exception:', err.message);
            callback(null);
        }
    }
}

module.exports = SupabaseSessionStore;
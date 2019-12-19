local value = redis.call("GET", KEYS[1])
if (not value) then
    redis.call("SET", KEYS[1], ARGV[1])
    return ARGV[1]
end
return value
